import { describe, it, expect } from 'vitest';
import { AuthService } from '../../modules/auth/auth.service.js';
import { db } from '../../shared/db.js';

const svc = new AuthService();

describe('AuthService.register', () => {
  it('creates user and returns tokens', async () => {
    const result = await svc.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');

    const dbUser = await db.user.findUnique({ where: { email: 'test@example.com' } });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.passwordHash).not.toBe('password123');
  });

  it('throws 409 when email already registered', async () => {
    await svc.register({ email: 'dupe@example.com', name: 'User', password: 'password123' });
    await expect(
      svc.register({ email: 'dupe@example.com', name: 'User2', password: 'password123' })
    ).rejects.toThrow('Email already in use');
  });
});

describe('AuthService.login', () => {
  it('returns tokens for valid credentials', async () => {
    await svc.register({ email: 'login@example.com', name: 'User', password: 'pass1234' });
    const result = await svc.login({ email: 'login@example.com', password: 'pass1234' });
    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
  });

  it('throws 401 for wrong password', async () => {
    await svc.register({ email: 'wp@example.com', name: 'User', password: 'correct99' });
    await expect(svc.login({ email: 'wp@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('throws 401 for unknown email', async () => {
    await expect(
      svc.login({ email: 'nobody@example.com', password: 'anything' })
    ).rejects.toThrow('Invalid credentials');
  });
});

describe('AuthService.refresh', () => {
  it('returns new tokens and invalidates old refresh token', async () => {
    const { refreshToken } = await svc.register({
      email: 'refresh@example.com',
      name: 'User',
      password: 'password123',
    });
    const result = await svc.refresh(refreshToken);
    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
    expect(result.refreshToken).not.toBe(refreshToken);

    const old = await db.refreshToken.findUnique({ where: { token: refreshToken } });
    expect(old).toBeNull();
  });

  it('throws 401 for unknown token', async () => {
    await expect(svc.refresh('not-a-real-token')).rejects.toThrow('Invalid refresh token');
  });
});

describe('AuthService.logout', () => {
  it('deletes the refresh token from DB', async () => {
    const { refreshToken } = await svc.register({
      email: 'logout@example.com',
      name: 'User',
      password: 'password123',
    });
    await svc.logout(refreshToken);
    const token = await db.refreshToken.findUnique({ where: { token: refreshToken } });
    expect(token).toBeNull();
  });
});

describe('AuthService.getUser', () => {
  it('returns user without passwordHash', async () => {
    const { user } = await svc.register({
      email: 'getme@example.com',
      name: 'Get Me',
      password: 'password123',
    });
    const found = await svc.getUser(user.id);
    expect(found).not.toBeNull();
    expect(found!.email).toBe('getme@example.com');
    expect((found as Record<string, unknown>).passwordHash).toBeUndefined();
  });
});
