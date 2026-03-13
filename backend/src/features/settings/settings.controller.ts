import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { updateSettingsSchema } from '../../shared/zod-schemas.js';

export const settingsController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      let settings = await prisma.settings.findUnique({
        where: { userId },
      });

      if (!settings) {
        settings = await prisma.settings.create({
          data: { userId },
        });
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = updateSettingsSchema.parse(req.body);

      // Strip id and userId if present to avoid prisma conflicts
      const { id, userId: bodyUserId, ...updateData } = validatedData as any;

      const settings = await prisma.settings.upsert({
        where: { userId },
        update: updateData,
        create: { ...updateData, userId },
      });
      res.json(settings);
    } catch (error) {
      next(error);
    }
  },
};
