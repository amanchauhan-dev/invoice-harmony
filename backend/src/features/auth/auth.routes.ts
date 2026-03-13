import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authMiddleware, authController.getMe);
