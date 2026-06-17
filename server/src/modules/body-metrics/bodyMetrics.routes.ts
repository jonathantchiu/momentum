import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createBodyMetric,
  getBodyMetrics,
  getBodyMetric,
  updateBodyMetric,
  deleteBodyMetric,
  getBodyMetricProgress,
} from './bodyMetrics.controller';

const router = Router();

router.use(authenticate);

router.get('/progress', getBodyMetricProgress);
router.get('/', getBodyMetrics);
router.post('/', createBodyMetric);
router.get('/:id', getBodyMetric);
router.put('/:id', updateBodyMetric);
router.delete('/:id', deleteBodyMetric);

export { router as bodyMetricsRouter };
