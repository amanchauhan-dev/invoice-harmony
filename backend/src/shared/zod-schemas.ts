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
  name: z.string().min(1).nullish(),
  email: z.string().email().nullish(),
});

// Settings validation
export const updateSettingsSchema = z.object({
  currency: z.string().length(3).nullish(),
  taxRate: z.number().min(0).max(100).nullish(),
  companyName: z.string().nullish(),
  companyAddress: z.string().nullish(),
  companyPhone: z.string().nullish(),
  companyEmail: z.union([z.string().email(), z.literal('')]).nullish(),
  companyLogo: z.union([z.string().url(), z.string().startsWith('data:image/'), z.literal('')]).nullish(),
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
