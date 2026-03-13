import { prisma } from '../../lib/prisma.js';

const transformInvoice = (invoice: any) => {
  if (!invoice) return null;
  const { customer, ...rest } = invoice;
  return {
    ...rest,
    customerName: customer?.name || rest.customerName || "",
    customerEmail: customer?.email || rest.customerEmail || "",
    customerAddress: customer?.address || rest.customerAddress || "",
    // Keep the nested customer object for compatibility if needed
    customer: customer || (rest.customerName ? { name: rest.customerName, email: rest.customerEmail } : null)
  };
};

export const invoiceService = {
  async getInvoices(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return invoices.map(transformInvoice);
  },

  async getInvoiceById(id: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        items: true,
        payments: true
      }
    });
    return transformInvoice(invoice);
  },

  async createInvoice(userId: string, data: any) {
    const { customerName, customerEmail, customerAddress, invoiceNumber, issueDate, dueDate, notes, items, subtotal, tax, totalAmount } = data;
    
    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { userId, email: customerEmail }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          name: customerName,
          email: customerEmail,
          address: customerAddress || null
        }
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        customerId: customer.id,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        subtotal,
        tax,
        totalAmount,
        status: 'Sent', // Default for new invoices for now
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });
    return transformInvoice(invoice);
  },

  async updateInvoiceStatus(id: string, status: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status }
    });
  },

  async updateInvoice(id: string, userId: string, data: any) {
    // First verify it belongs to user
    await prisma.invoice.findFirstOrThrow({ where: { id, userId } });

    // Assuming we only update standard fields, skipping full relations replace for now
    const { invoiceNumber, issueDate, dueDate, notes, subtotal, tax, totalAmount, status } = data;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(invoiceNumber && { invoiceNumber }),
        ...(issueDate && { issueDate: new Date(issueDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes }),
        ...(subtotal !== undefined && { subtotal }),
        ...(tax !== undefined && { tax }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(status && { status })
      },
      include: {
        customer: true,
        items: true
      }
    });
    return transformInvoice(invoice);
  },

  async deleteInvoice(id: string, userId: string) {
    return prisma.invoice.deleteMany({
      where: { id, userId }
    });
  },

  async getPublicInvoiceData(id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id },
      include: {
        customer: true,
        items: true,
        payments: true,
        user: {
          include: {
            settings: true
          }
        }
      }
    });
    if (!invoice) return null;

    const { user, customer, ...rest } = invoice as any;
    return {
      ...rest,
      customerName: customer?.name || "",
      customerEmail: customer?.email || "",
      customerAddress: customer?.address || "",
      customer,
      company: {
        name: user?.settings?.companyName || user?.name || "InvoiceHarmony",
        email: user?.settings?.companyEmail || user?.email || "",
        phone: user?.settings?.companyPhone || "",
        address: user?.settings?.companyAddress || "",
        logo: user?.settings?.companyLogo || null,
        currency: user?.settings?.currency || "USD",
        taxRate: user?.settings?.taxRate || 0,
      }
    };
  }
};
