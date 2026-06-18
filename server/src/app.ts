import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './modules/auth/auth.routes';
import { nutritionRouter } from './modules/nutrition/nutrition.routes';
import { sleepRouter } from './modules/sleep/sleep.routes';
import { fitnessRouter } from './modules/fitness/fitness.routes';
import { bodyMetricsRouter } from './modules/body-metrics/bodyMetrics.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/sleep', sleepRouter);
app.use('/api/fitness', fitnessRouter);
app.use('/api/body-metrics', bodyMetricsRouter);

app.use(errorHandler);

export { app };
