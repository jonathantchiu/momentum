import type { Request, Response, NextFunction } from 'express';
import { fail } from '../lib/response.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(fail(error.message));
    return;
  }
  console.error(error);
  res.status(500).json(fail('Internal server error'));
}
