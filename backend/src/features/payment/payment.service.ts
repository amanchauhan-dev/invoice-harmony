import { prisma } from '../../lib/prisma.js';

export const paymentService = {
  async createPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    notes?: string;
    userId: string;
  }) {
    return await prisma.$transaction(async (tx: any) => {
      // First verify the invoice belongs to the user
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId, userId: data.userId },
      });

      if (!invoice) {
        throw new Error('Invoice not found or unauthorized');
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes
        },
      });

      // Update invoice paidAmount and status
      if (invoice) {
        const newPaidAmount = invoice.paidAmount + data.amount;
        let newStatus = invoice.status;
        
        if (newPaidAmount >= invoice.totalAmount) {
          newStatus = 'Paid';
        } else if (newPaidAmount > 0) {
          newStatus = 'Partially Paid';
        }

        await tx.invoice.update({
          where: { id: invoice.id },
          data: { 
            paidAmount: newPaidAmount,
            status: newStatus 
          },
        });
      }

      return payment;
    });
  },

  async getPaymentsByInvoice(invoiceId: string, userId: string) {
    // Verify invoice ownership first
    await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId, userId }});

    return await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async getPayments(userId: string) {
    return await prisma.payment.findMany({
      where: {
        invoice: {
          userId
        }
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async deletePayment(id: string, userId: string) {
    // Verify payment belongs to an invoice owned by the user
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true }
    });

    if (!payment || payment.invoice.userId !== userId) {
      throw new Error('Payment not found or unauthorized');
    }

    return await prisma.payment.delete({
      where: { id },
    });
  },
};
