import { prisma } from '../../lib/prisma.js';

export const customerService = {
  async getAll(userId: string) {
    return prisma.customer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    });
  },

  async getById(id: string, userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id, userId },
      include: {
        invoices: {
          orderBy: { issueDate: 'desc' }
        }
      }
    });
    
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  async create(userId: string, data: any) {
    return prisma.customer.create({
      data: {
        ...data,
        userId
      }
    });
  },

  async update(id: string, userId: string, data: any) {
    // Verify ownership
    await this.getById(id, userId);

    return prisma.customer.update({
      where: { id },
      data
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.getById(id, userId);

    return prisma.customer.delete({
      where: { id }
    });
  }
};
