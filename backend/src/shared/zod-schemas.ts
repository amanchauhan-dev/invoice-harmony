import { z } from 'zod';

// Payment validation
export const createPaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  amount: z.number().positive(),
  paymentDate: z.coerce.date().default(() => new Date()),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

// Profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

// Settings validation
export const updateSettingsSchema = z.object({
  currency: z.string().length(3).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional(),
  companyLogo: z.string().url().or(z.string().startsWith('data:image/')).optional(),
});

// Invoice validation
export const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerAddress: z.string().optional(),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    rate: z.number().nonnegative(),
  })),
  subtotal: z.number(),
  tax: z.number(),
  totalAmount: z.number(),
});

export const updateInvoiceSchema = invoiceSchema.partial();
