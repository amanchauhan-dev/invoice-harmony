import 'dotenv/config';
import { createRequire } from 'node:module';
import { PrismaPg } from '@prisma/adapter-pg';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('../generated/prisma/index.js') as { PrismaClient: new (options: Record<string, unknown>) => unknown };

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: unknown };

export const prisma: ReturnType<typeof createPrisma> = 
  (globalForPrisma.prisma as ReturnType<typeof createPrisma>) ?? createPrisma();

function createPrisma() {
  return new PrismaClient({ adapter }) as any;
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
