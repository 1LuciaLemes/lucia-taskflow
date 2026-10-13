import { NextFunction, Request, Response } from 'express';
import { runWithSession } from '../utils/sessionContext.js';

export const SESSION_HEADER = 'x-demo-session';

export function demoSession(req: Request, _res: Response, next: NextFunction): void {
  const sessionId = req.header(SESSION_HEADER)?.trim();
  if (!sessionId) {
    next();
    return;
  }

  runWithSession(sessionId, next);
}
