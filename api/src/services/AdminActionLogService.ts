import { prisma } from '../lib/prisma';

export interface AdminActionLogEntry {
  id: string;
  actorId: string;
  actorEmail: string | null;
  actorRole: string;
  method: string;
  path: string;
  entity: string | null;
  entityId: string | null;
  statusCode: number;
  createdAt: string;
}

export interface AdminActionLogPage {
  data: AdminActionLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export class AdminActionLogService {
  async list(opts: {
    limit?: number;
    offset?: number;
    entity?: string;
    actorId?: string;
  }): Promise<AdminActionLogPage> {
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const offset = Math.max(opts.offset ?? 0, 0);
    const where: Record<string, unknown> = {};
    if (opts.entity) where.entity = opts.entity;
    if (opts.actorId) where.actorId = opts.actorId;
    const [rows, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.adminActionLog.count({ where }),
    ]);
    return {
      data: rows.map((r) => ({
        id: r.id,
        actorId: r.actorId,
        actorEmail: r.actorEmail,
        actorRole: r.actorRole,
        method: r.method,
        path: r.path,
        entity: r.entity,
        entityId: r.entityId,
        statusCode: r.statusCode,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    };
  }
}
