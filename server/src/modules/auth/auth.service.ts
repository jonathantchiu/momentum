import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../shared/db.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET!;
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const selectedUser = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

function signAccess(userId: string): string {
  return jwt.sign({ userId }, ACCESS_SECRET(), { expiresIn: '15m' });
}

function signRefresh(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET(), { expiresIn: '7d' });
}

async function storeRefreshToken(userId: string, token: string) {
  await db.refreshToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS) },
  });
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError(409, 'Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await db.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: selectedUser,
    });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    const user = await db.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const stored = await db.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid refresh token');
    }

    try {
      jwt.verify(token, REFRESH_SECRET());
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }

    await db.refreshToken.delete({ where: { token } });

    const accessToken = signAccess(stored.userId);
    const refreshToken = signRefresh(stored.userId);
    await storeRefreshToken(stored.userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    await db.refreshToken.deleteMany({ where: { token } });
  }

  async getUser(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, preferences: true, createdAt: true },
    });
  }
}
