import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { z, ZodError } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: (error as any).errors[0].message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: (error as any).errors[0].message });
      } else {
        res.status(401).json({ error: error.message });
      }
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const user = await authService.getMe(userId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
