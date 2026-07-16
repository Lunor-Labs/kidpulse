import { NextFunction, Request, Response } from 'express';
import { AddressInput, AddressService } from '../services/AddressService';
import { AppError } from '../lib/AppError';

export class AddressController {
  constructor(private service = new AddressService()) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const rows = await this.service.list(req.user);
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const input = res.locals.body as AddressInput;
      const row = await this.service.create(req.user, input);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const input = res.locals.body as AddressInput;
      const row = await this.service.update(req.user, req.params.id, input);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      await this.service.remove(req.user, req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
