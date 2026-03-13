import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { createPaymentSchema } from '../../shared/zod-schemas.js';
import { prisma } from '../../lib/prisma.js';

export const paymentController = {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const payment = await paymentService.createPayment({
        ...validatedData,
        userId: req.user!.userId
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getPayments(req.user!.userId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  },

  async getInvoicePayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const payments = await paymentService.getPaymentsByInvoice(invoiceId as string, req.user!.userId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  },

  async deletePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await paymentService.deletePayment(id as string, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Public payment — no auth token required
  async createPublicPayment(req: Request, res: Response) {
    try {
      const { invoiceId, amount, paymentMethod, notes } = req.body;

      if (!invoiceId || !amount || !paymentMethod) {
        res.status(400).json({ error: 'invoiceId, amount, and paymentMethod are required' });
        return;
      }

      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }
      if (invoice.status === 'Paid') {
        res.status(409).json({ error: 'Invoice is already paid' });
        return;
      }

      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          amount: parseFloat(amount),
          paymentMethod,
          notes: notes || null,
          paymentDate: new Date(),
        }
      });

      // Update invoice paidAmount and status
      const newPaidAmount = invoice.paidAmount + parseFloat(amount);
      const newStatus = newPaidAmount >= invoice.totalAmount ? 'Paid' : 'Sent';
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus }
      });

      res.status(201).json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
