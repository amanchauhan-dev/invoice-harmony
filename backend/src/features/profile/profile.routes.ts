import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.getProfile);
profileRouter.patch('/', profileController.updateProfile);
