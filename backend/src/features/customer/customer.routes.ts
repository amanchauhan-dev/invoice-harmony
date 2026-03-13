import { Router } from 'express';
import { customerController } from './customer.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const customerRouter = Router();

// Apply auth middleware to all customer routes
customerRouter.use(authMiddleware);

customerRouter.get('/', customerController.getAll);
customerRouter.post('/', customerController.create);
customerRouter.get('/:id', customerController.getById);
customerRouter.put('/:id', customerController.update);
customerRouter.delete('/:id', customerController.delete);
