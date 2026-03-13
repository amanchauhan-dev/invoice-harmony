import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { updateProfileSchema } from '../../shared/zod-schemas.js';

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const validatedData = updateProfileSchema.parse(req.body);
      const user = await prisma.user.update({
        where: { id: userId },
        data: validatedData,
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
