import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getExercises,
  getExercise,
  createCustomExercise,
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
  addSet,
  getPersonalRecords,
  getWorkoutStats,
} from './fitness.controller';

const router = Router();

router.use(authenticate);

// Exercise library
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExercise);
router.post('/exercises', createCustomExercise);

// Stats & PRs
router.get('/stats', getWorkoutStats);
router.get('/personal-records', getPersonalRecords);

// Sessions
router.get('/sessions', getWorkoutSessions);
router.post('/sessions', createWorkoutSession);
router.get('/sessions/:id', getWorkoutSession);
router.put('/sessions/:id', updateWorkoutSession);
router.delete('/sessions/:id', deleteWorkoutSession);
router.post('/sessions/:id/sets', addSet);

export { router as fitnessRouter };
