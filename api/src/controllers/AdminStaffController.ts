import { NextFunction, Request, Response } from 'express';
import { AdminStaffService } from '../services/AdminStaffService';
import type { StaffCreateInput, StaffUpdateInput } from '../types/adminSchemas';

export class AdminStaffController {
  constructor(private service = new AdminStaffService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.service.list();
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  create = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as StaffCreateInput;
      const row = await this.service.create(body);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as StaffUpdateInput;
      let row = await this.service.updateRole(req.params.id, body.role);
      if (typeof body.isActive === 'boolean') {
        row = await this.service.setActive(req.params.id, body.isActive);
      }
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
