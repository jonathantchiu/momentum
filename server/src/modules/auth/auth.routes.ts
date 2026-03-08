import { Router } from 'express';
import { register, login, refresh, logout, me } from './auth.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
