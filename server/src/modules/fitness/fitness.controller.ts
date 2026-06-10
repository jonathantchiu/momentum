import { Request, Response, NextFunction } from 'express';
import { FitnessService } from './fitness.service';
import {
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
  addSetSchema,
  exerciseQuerySchema,
  sessionQuerySchema,
  exerciseSchema,
} from './fitness.schemas';
import { success } from '../../lib/response';
import { AppError } from '../../lib/errors';

const service = new FitnessService();

// ─── Exercises ─────────────────────────────────────────────────────────

export async function getExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const query = exerciseQuerySchema.parse(req.query);
    const result = await service.getExercises(query);
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function getExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const ex = await service.getExercise(req.params.id);
    res.json(success(ex));
  } catch (err) { next(err); }
}

export async function createCustomExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = exerciseSchema.parse(req.body);
    const ex = await service.createCustomExercise(userId, input);
    res.status(201).json(success(ex));
  } catch (err) { next(err); }
}

// ─── Workout Sessions ───────────────────────────────────────────────────

export async function createWorkoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = createWorkoutSessionSchema.parse(req.body);
    const session = await service.createSession(userId, input);
    res.status(201).json(success(session));
  } catch (err) { next(err); }
}

export async function getWorkoutSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const query = sessionQuerySchema.parse(req.query);
    const result = await service.getSessions(userId, query);
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function getWorkoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const session = await service.getSession(userId, req.params.id);
    res.json(success(session));
  } catch (err) { next(err); }
}

export async function updateWorkoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = updateWorkoutSessionSchema.parse(req.body);
    const session = await service.updateSession(userId, req.params.id, input);
    res.json(success(session));
  } catch (err) { next(err); }
}

export async function deleteWorkoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await service.deleteSession(userId, req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) { next(err); }
}

export async function addSet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = addSetSchema.parse(req.body);
    const set = await service.addSet(userId, req.params.id, input);
    res.status(201).json(success(set));
  } catch (err) { next(err); }
}

// ─── Personal Records ───────────────────────────────────────────────────

export async function getPersonalRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const prs = await service.getPersonalRecords(userId);
    res.json(success(prs));
  } catch (err) { next(err); }
}

export async function getWorkoutStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    if (isNaN(days) || days < 1 || days > 365) throw new AppError('days must be 1-365', 400);
    const stats = await service.getWorkoutStats(userId, days);
    res.json(success(stats));
  } catch (err) { next(err); }
}
