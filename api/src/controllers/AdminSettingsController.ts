import { NextFunction, Request, Response } from 'express';
import { AdminSettingsService } from '../services/AdminSettingsService';
import type { AdminSettingsInput } from '../types/adminSchemas';

export class AdminSettingsController {
  constructor(private service = new AdminSettingsService()) {}

  get = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.service.get();
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as AdminSettingsInput;
      const row = await this.service.update(body);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };
}
