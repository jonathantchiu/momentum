import { Request, Response, NextFunction } from 'express';
import { BodyMetricsService } from './bodyMetrics.service';
import { createBodyMetricSchema, updateBodyMetricSchema, bodyMetricQuerySchema } from './bodyMetrics.schemas';
import { success } from '../../lib/response';
import { AppError } from '../../lib/errors';

const service = new BodyMetricsService();

export async function createBodyMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = createBodyMetricSchema.parse(req.body);
    const metric = await service.createMetric(userId, input);
    res.status(201).json(success(metric));
  } catch (err) { next(err); }
}

export async function getBodyMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const query = bodyMetricQuerySchema.parse(req.query);
    const result = await service.getMetrics(userId, query);
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function getBodyMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const metric = await service.getMetric(userId, req.params.id);
    res.json(success(metric));
  } catch (err) { next(err); }
}

export async function updateBodyMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const input = updateBodyMetricSchema.parse(req.body);
    const metric = await service.updateMetric(userId, req.params.id, input);
    res.json(success(metric));
  } catch (err) { next(err); }
}

export async function deleteBodyMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await service.deleteMetric(userId, req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) { next(err); }
}

export async function getBodyMetricProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 90;
    if (isNaN(days) || days < 1 || days > 365) throw new AppError('days must be 1-365', 400);
    const progress = await service.getProgress(userId, days);
    res.json(success(progress));
  } catch (err) { next(err); }
}
