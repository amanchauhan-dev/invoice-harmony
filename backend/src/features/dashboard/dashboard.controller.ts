import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getOverview(req: Request, res: Response) {
    try {
      const overview = await dashboardService.getOverview(req.user!.userId);
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
