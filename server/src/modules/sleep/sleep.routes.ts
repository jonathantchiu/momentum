import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createSleepLog,
  getSleepLogs,
  getSleepLog,
  updateSleepLog,
  deleteSleepLog,
  getSleepTrends,
} from './sleep.controller';

const router = Router();

router.use(authenticate);

router.get('/trends', getSleepTrends);
router.get('/', getSleepLogs);
router.post('/', createSleepLog);
router.get('/:id', getSleepLog);
router.put('/:id', updateSleepLog);
router.delete('/:id', deleteSleepLog);

export { router as sleepRouter };
