import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret';
const EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1d';

export const authService = {
  async register(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        settings: {
          create: {
            currency: 'USD',
            taxRate: 0
          }
        }
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: EXPIRES_IN as any });
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: EXPIRES_IN as any });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        settings: true
      }
    });

    if (!user) throw new Error('User not found');
    return user;
  }
};
