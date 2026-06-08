import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { error } from '../lib/response';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json(error('Validation error', 400, err.flatten().fieldErrors));
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(error(err.message, err.statusCode));
  }
  console.error(err);
  return res.status(500).json(error('Internal server error', 500));
}
