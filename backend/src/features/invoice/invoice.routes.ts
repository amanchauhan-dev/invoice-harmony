import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public route — no auth required
router.get('/public/:id', invoiceController.getPublicInvoice);

router.use(authMiddleware);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.patch('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export const invoiceRouter = router;
