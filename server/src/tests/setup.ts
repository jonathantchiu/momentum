import { config } from 'dotenv';
config({ path: '.env.test' });

import { afterAll, beforeEach } from 'vitest';
import { db } from '../shared/db.js';

beforeEach(async () => {
  await db.refreshToken.deleteMany();
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});
