import { NextFunction, Request, Response } from 'express';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function extractKey(req: Request): string | undefined {
  const headerKey = req.header('x-api-key');
  if (headerKey) {
    return headerKey;
  }

  const authorization = req.header('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  return undefined;
}

export function demoGate(req: Request, res: Response, next: NextFunction): void {
  const expectedKey = process.env.DEMO_API_KEY;
  if (!expectedKey || !WRITE_METHODS.has(req.method)) {
    next();
    return;
  }

  if (extractKey(req) !== expectedKey) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Se requiere una clave de acceso para modificar tareas',
    });
    return;
  }

  next();
}
