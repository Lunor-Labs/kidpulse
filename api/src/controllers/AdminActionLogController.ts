import { NextFunction, Request, Response } from 'express';
import { AdminActionLogService } from '../services/AdminActionLogService';

export class AdminActionLogController {
  constructor(private service = new AdminActionLogService()) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit =
        typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : undefined;
      const offset =
        typeof req.query.offset === 'string' ? Number.parseInt(req.query.offset, 10) : undefined;
      const entity = typeof req.query.entity === 'string' ? req.query.entity : undefined;
      const actorId = typeof req.query.actorId === 'string' ? req.query.actorId : undefined;
      const page = await this.service.list({ limit, offset, entity, actorId });
      res.json({ data: page });
    } catch (error) {
      next(error);
    }
  };
}
