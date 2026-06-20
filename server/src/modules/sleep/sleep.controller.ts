import { Request, Response, NextFunction } from 'express';
import { SleepService } from './sleep.service';
import { createSleepLogSchema, updateSleepLogSchema, sleepQuerySchema } from './sleep.schemas';
import { success } from '../../lib/response';
import { AppError } from '../../lib/errors';

const service = new SleepService();

export async function createSleepLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = createSleepLogSchema.parse(req.body);
    const log = await service.createLog(userId, input);
    res.status(201).json(success(log));
  } catch (err) {
    next(err);
  }
}

export async function getSleepLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const query = sleepQuerySchema.parse(req.query);
    const result = await service.getLogs(userId, query);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getSleepLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const log = await service.getLog(userId, req.params.id);
    res.json(success(log));
  } catch (err) {
    next(err);
  }
}

export async function updateSleepLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = updateSleepLogSchema.parse(req.body);
    const log = await service.updateLog(userId, req.params.id, input);
    res.json(success(log));
  } catch (err) {
    next(err);
  }
}

export async function deleteSleepLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await service.deleteLog(userId, req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) {
    next(err);
  }
}

export async function getSleepTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    if (isNaN(days) || days < 1 || days > 365) {
      throw new AppError('days must be between 1 and 365', 400);
    }
    const trends = await service.getTrends(userId, days);
    res.json(success(trends));
  } catch (err) {
    next(err);
  }
}
