import { Request, Response } from 'express';
import { customerService } from './customer.service.js';
import { z, ZodError } from 'zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
});

export const customerController = {
  async getAll(req: Request, res: Response) {
    try {
      const customers = await customerService.getAll(req.user!.userId);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const customer = await customerService.getById(req.params.id as string, req.user!.userId);
      res.json(customer);
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = customerSchema.parse(req.body);
      const customer = await customerService.create(req.user!.userId, data);
      res.status(201).json(customer);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: (error as any).errors[0].message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = customerSchema.partial().parse(req.body);
      const customer = await customerService.update(req.params.id as string, req.user!.userId, data);
      res.json(customer);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: (error as any).errors[0].message });
      } else if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await customerService.delete(req.params.id as string, req.user!.userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
};
