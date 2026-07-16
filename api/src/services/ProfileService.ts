import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { AuthUser } from '../types/express';
import { ProfileDto } from '../types/dto';

export interface ProfileUpdateInput {
  fullName?: string | null;
  phone?: string | null;
}

export class ProfileService {
  async ensureProfile(user: AuthUser): Promise<ProfileDto> {
    if (!user.email) throw new AppError('User has no email', 400);
    try {
      let profile = await prisma.userProfile.upsert({
        where: { id: user.id },
        create: { id: user.id, email: user.email, fullName: user.fullName ?? null },
        update: { email: user.email },
      });
      if (!profile.fullName && user.fullName) {
        profile = await prisma.userProfile.update({
          where: { id: user.id },
          data: { fullName: user.fullName },
        });
      }
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
      };
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to ensure profile');
      throw new AppError('Unable to load profile', 500);
    }
  }

  async updateProfile(user: AuthUser, input: ProfileUpdateInput): Promise<ProfileDto> {
    await this.ensureProfile(user);
    try {
      const profile = await prisma.userProfile.update({
        where: { id: user.id },
        data: {
          fullName: input.fullName ?? null,
          phone: input.phone ?? null,
        },
      });
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
      };
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to update profile');
      throw new AppError('Unable to update profile', 500);
    }
  }
}
