import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function deriveEntity(path: string): { entity: string | null; entityId: string | null } {
  const segments = path.split('?')[0].split('/').filter(Boolean);
  const adminIdx = segments.indexOf('admin');
  if (adminIdx < 0) return { entity: null, entityId: null };
  const rest = segments.slice(adminIdx + 1);
  if (rest.length === 0) return { entity: null, entityId: null };
  return {
    entity: rest[0] ?? null,
    entityId: rest[1] ?? null,
  };
}

export function adminActionLog(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }
  res.on('finish', () => {
    if (!req.user) return;
    if (res.statusCode >= 400) return;
    const { entity, entityId } = deriveEntity(req.originalUrl || req.url);
    void prisma.adminActionLog
      .create({
        data: {
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          method: req.method,
          path: (req.originalUrl || req.url).split('?')[0].slice(0, 500),
          entity: entity ? entity.slice(0, 80) : null,
          entityId: entityId ? entityId.slice(0, 80) : null,
          statusCode: res.statusCode,
        },
      })
      .catch(() => {
        /* logging must never break a request */
      });
  });
  next();
}
