import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import { ok } from '../../shared/lib/response.js';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';

const svc = new AuthService();
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);

    const { user, accessToken, refreshToken } = await svc.register(input.data);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(201).json(ok({ user, accessToken }));
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);

    const { user, accessToken, refreshToken } = await svc.login(input.data);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json(ok({ user, accessToken }));
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw new AppError(401, 'Missing refresh token');

    const { accessToken, refreshToken } = await svc.refresh(token);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json(ok({ accessToken }));
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) await svc.logout(token);
    res.clearCookie('refreshToken');
    res.json(ok(null));
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).userId;
    const user = await svc.getUser(userId);
    if (!user) throw new AppError(404, 'User not found');
    res.json(ok({ user }));
  } catch (e) {
    next(e);
  }
}
