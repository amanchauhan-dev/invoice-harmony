import { prisma } from '../../lib/prisma.js';

export const invoiceService = {
  async getInvoices(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getInvoiceById(id: string, userId: string) {
    return prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        items: true,
        payments: true
      }
    });
  },

  async createInvoice(userId: string, data: any) {
    const { customerName, customerEmail, customerAddress, invoiceNumber, issueDate, dueDate, notes, items, subtotal, tax, totalAmount } = data;
    
    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { userId, email: customerEmail }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          name: customerName,
          email: customerEmail,
          address: customerAddress || null
        }
      });
    }

    return prisma.invoice.create({
      data: {
        userId,
        customerId: customer.id,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        subtotal,
        tax,
        totalAmount,
        status: 'Sent', // Default for new invoices for now
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });
  },

  async updateInvoiceStatus(id: string, status: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status }
    });
  },

  async updateInvoice(id: string, userId: string, data: any) {
    // First verify it belongs to user
    await prisma.invoice.findFirstOrThrow({ where: { id, userId } });

    // Assuming we only update standard fields, skipping full relations replace for now
    const { invoiceNumber, issueDate, dueDate, notes, subtotal, tax, totalAmount, status } = data;
    return prisma.invoice.update({
      where: { id },
      data: {
        ...(invoiceNumber && { invoiceNumber }),
        ...(issueDate && { issueDate: new Date(issueDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes }),
        ...(subtotal !== undefined && { subtotal }),
        ...(tax !== undefined && { tax }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(status && { status })
      }
    });
  },

  async deleteInvoice(id: string, userId: string) {
    return prisma.invoice.deleteMany({
      where: { id, userId }
    });
  }
};
