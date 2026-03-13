import { prisma } from '../../lib/prisma.js';

export const dashboardService = {
  async getOverview(userId: string) {
    const defaultSettings = await prisma.settings.findUnique({
      where: { userId }
    });
    
    // Total Revenue (Paid Invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      where: { userId, status: 'Paid' },
      _sum: { totalAmount: true }
    });

    // Total Invoices
    const totalInvoices = await prisma.invoice.count({
      where: { userId }
    });

    // Pending Payments 
    // Calculate total amount - paidAmount for invoices that are technically unpaid (Draft, Sent, Overdue)
    const pendingInvoices = await prisma.invoice.findMany({
      where: { userId, status: { in: ['Draft', 'Sent', 'Overdue'] } },
      select: { totalAmount: true, paidAmount: true }
    });
    
    const pendingPayments = pendingInvoices.reduce((acc: number, inv: { totalAmount: number, paidAmount: number }) => acc + (inv.totalAmount - inv.paidAmount), 0);

    // Active Customers
    const activeCustomersCount = await prisma.customer.count({
      where: { userId }
    });

    // Recent Invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { name: true, email: true } }
      }
    });

    return {
      overview: {
        totalRevenue: paidInvoices._sum.totalAmount || 0,
        totalInvoices,
        pendingPayments,
        activeCustomers: activeCustomersCount,
        currency: defaultSettings?.currency || 'USD'
      },
      recentInvoices
    };
  }
};
