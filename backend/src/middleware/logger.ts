/**
 * Request logging middleware
 */

import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  console.log(`→ ${req.method} ${req.url}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusSymbol = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';

    console.log(
      `${statusSymbol} ${req.method} ${req.url} - ${status} - ${duration}ms`
    );
  });

  next();
};
