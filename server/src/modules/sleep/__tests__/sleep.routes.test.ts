import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { db } from '../../../lib/db';
import { createTestUser, getAuthToken, cleanupUser } from '../../../test/helpers';

describe('Sleep Routes', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const user = await createTestUser();
    userId = user.id;
    token = await getAuthToken(user.email);
  });

  afterAll(async () => {
    await db.sleepLog.deleteMany({ where: { userId } });
    await cleanupUser(userId);
  });

  describe('POST /api/sleep', () => {
    it('should create a sleep log', async () => {
      const res = await request(app)
        .post('/api/sleep')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bedtime: '2024-01-15T22:00:00.000Z',
          wakeTime: '2024-01-16T06:30:00.000Z',
          quality: 4,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.durationMin).toBe(510);
      expect(res.body.data.quality).toBe(4);
    });

    it('should reject invalid quality', async () => {
      const res = await request(app)
        .post('/api/sleep')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bedtime: '2024-01-15T22:00:00.000Z',
          wakeTime: '2024-01-16T06:30:00.000Z',
          quality: 10,
        });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/sleep')
        .send({ bedtime: '2024-01-15T22:00:00.000Z', wakeTime: '2024-01-16T06:00:00.000Z', quality: 3 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sleep', () => {
    it('should return sleep logs', async () => {
      const res = await request(app)
        .get('/api/sleep')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('GET /api/sleep/trends', () => {
    it('should return sleep trends', async () => {
      const res = await request(app)
        .get('/api/sleep/trends?days=30')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('avgDurationMin');
      expect(res.body.data).toHaveProperty('consistencyScore');
    });
  });
});
