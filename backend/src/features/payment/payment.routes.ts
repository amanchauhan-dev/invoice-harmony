import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const paymentRouter = Router();

// Public route — no auth required
paymentRouter.post('/public', paymentController.createPublicPayment);

paymentRouter.use(authMiddleware);

paymentRouter.post('/', paymentController.createPayment);
paymentRouter.get('/', paymentController.getAllPayments);
paymentRouter.get('/invoice/:invoiceId', paymentController.getInvoicePayments);
paymentRouter.delete('/:id', paymentController.deletePayment);
