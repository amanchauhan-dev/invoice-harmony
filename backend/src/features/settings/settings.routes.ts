import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const settingsRouter = Router();

settingsRouter.use(authMiddleware);

settingsRouter.get('/', settingsController.getSettings);
settingsRouter.patch('/', settingsController.updateSettings);
