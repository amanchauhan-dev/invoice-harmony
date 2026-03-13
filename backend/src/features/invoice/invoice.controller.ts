import { Request, Response } from 'express';
import { invoiceService } from './invoice.service.js';
import { invoiceSchema } from '../../shared/zod-schemas.js';

export const invoiceController = {
  async getAllInvoices(req: Request, res: Response) {
    try {
      const invoices = await invoiceService.getInvoices(req.user!.userId);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoiceById(id as string, req.user!.userId);
      
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }
      
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createInvoice(req: Request, res: Response) {
    try {
      const data = invoiceSchema.parse(req.body);
      const invoice = await invoiceService.createInvoice(req.user!.userId, data);
      res.status(201).json(invoice);
    } catch (error: any) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ error: (error as any).errors });
      } else {
        res.status(500).json({ error: 'Failed to create invoice' });
      }
    }
  },

  async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = invoiceSchema.partial().parse(req.body);
      const invoice = await invoiceService.updateInvoice(id as string, req.user!.userId, data);
      res.json(invoice);
    } catch (error: any) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ error: (error as any).errors });
      } else {
        res.status(500).json({ error: 'Failed to update invoice' });
      }
    }
  },

  async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await invoiceService.deleteInvoice(id as string, req.user!.userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
