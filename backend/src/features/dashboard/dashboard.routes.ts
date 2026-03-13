import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const dashboardRouter = Router();

// Apply auth middleware to all dashboard routes
dashboardRouter.use(authMiddleware);

dashboardRouter.get('/overview', dashboardController.getOverview);
