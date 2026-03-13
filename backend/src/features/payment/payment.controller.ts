import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { createPaymentSchema } from '../../shared/zod-schemas.js';

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
};
