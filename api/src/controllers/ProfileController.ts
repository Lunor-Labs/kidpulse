import { NextFunction, Request, Response } from 'express';
import { ProfileService, ProfileUpdateInput } from '../services/ProfileService';
import { AppError } from '../lib/AppError';

export class ProfileController {
  constructor(private service = new ProfileService()) {}

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const profile = await this.service.ensureProfile(req.user);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const input = res.locals.body as ProfileUpdateInput;
      const profile = await this.service.updateProfile(req.user, input);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  };
}
