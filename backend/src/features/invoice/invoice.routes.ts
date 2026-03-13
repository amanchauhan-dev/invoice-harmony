import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export const invoiceRouter = router;
