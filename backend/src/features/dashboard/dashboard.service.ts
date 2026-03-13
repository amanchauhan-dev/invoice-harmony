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
    const pendingInvoices = await prisma.invoice.findMany({
      where: { userId, status: { in: ['Draft', 'Sent', 'Overdue'] } },
      select: { totalAmount: true, paidAmount: true }
    });
    
    const pendingPayments = pendingInvoices.reduce(
      (acc: number, inv: { totalAmount: number; paidAmount: number }) =>
        acc + (inv.totalAmount - inv.paidAmount),
      0
    );

    // Active Customers
    const activeCustomersCount = await prisma.customer.count({
      where: { userId }
    });

    // Recent Invoices
    const rawRecentInvoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { name: true, email: true, address: true } }
      }
    });

    const recentInvoices = rawRecentInvoices.map((inv: any) => ({
      ...inv,
      customerName: inv.customer?.name || '',
      customerEmail: inv.customer?.email || '',
      customerAddress: inv.customer?.address || '',
    }));

    // ── Current-month revenue breakdown ─────────────────────────────────────
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Collected this month = sum of paidAmount on invoices that became Paid this month
    const collectedThisMonth = await prisma.invoice.aggregate({
      where: { userId, status: 'Paid', updatedAt: { gte: monthStart, lte: monthEnd } },
      _sum: { paidAmount: true }
    });

    // Pending this month = unpaid balance on non-overdue invoices issued this month
    const pendingThisMonthRows = await prisma.invoice.findMany({
      where: { userId, status: { in: ['Draft', 'Sent'] }, issueDate: { gte: monthStart, lte: monthEnd } },
      select: { totalAmount: true, paidAmount: true }
    });
    const pendingThisMonth = pendingThisMonthRows.reduce(
      (acc: number, inv: { totalAmount: number; paidAmount: number }) =>
        acc + (inv.totalAmount - inv.paidAmount),
      0
    );

    // Overdue this month = unpaid balance on overdue invoices with due date this month or earlier
    const overdueThisMonthRows = await prisma.invoice.findMany({
      where: { userId, status: 'Overdue' },
      select: { totalAmount: true, paidAmount: true }
    });
    const overdueThisMonth = overdueThisMonthRows.reduce(
      (acc: number, inv: { totalAmount: number; paidAmount: number }) =>
        acc + (inv.totalAmount - inv.paidAmount),
      0
    );

    const monthlyTotal =
      (collectedThisMonth._sum.paidAmount || 0) + pendingThisMonth + overdueThisMonth;

    return {
      overview: {
        totalRevenue: paidInvoices._sum.totalAmount || 0,
        totalInvoices,
        pendingPayments,
        activeCustomers: activeCustomersCount,
        currency: defaultSettings?.currency || 'USD'
      },
      recentInvoices,
      monthlyRevenue: {
        total: monthlyTotal,
        collected: collectedThisMonth._sum.paidAmount || 0,
        pending: pendingThisMonth,
        overdue: overdueThisMonth,
        currency: defaultSettings?.currency || 'USD'
      }
    };
  }
};
