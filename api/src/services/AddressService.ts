import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { AuthUser } from '../types/express';
import { AddressDto } from '../types/dto';
import { ProfileService } from './ProfileService';

export interface AddressInput {
  label?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

type AddressRow = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

function toDto(a: AddressRow): AddressDto {
  return {
    id: a.id,
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2,
    city: a.city,
    district: a.district,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
  };
}

export class AddressService {
  constructor(private profileService = new ProfileService()) {}

  async list(user: AuthUser): Promise<AddressDto[]> {
    await this.profileService.ensureProfile(user);
    const rows = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return rows.map(toDto);
  }

  async create(user: AuthUser, input: AddressInput): Promise<AddressDto> {
    await this.profileService.ensureProfile(user);
    try {
      const created = await prisma.$transaction(async (tx) => {
        if (input.isDefault) {
          await tx.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
          });
        }
        return tx.address.create({
          data: {
            userId: user.id,
            label: input.label ?? null,
            fullName: input.fullName,
            phone: input.phone,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 ?? null,
            city: input.city,
            district: input.district,
            postalCode: input.postalCode ?? null,
            country: input.country ?? 'Sri Lanka',
            isDefault: input.isDefault ?? false,
          },
        });
      });
      return toDto(created);
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to create address');
      throw new AppError('Unable to create address', 500);
    }
  }

  async update(user: AuthUser, id: string, input: AddressInput): Promise<AddressDto> {
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new AppError('Address not found', 404);
    try {
      const updated = await prisma.$transaction(async (tx) => {
        if (input.isDefault) {
          await tx.address.updateMany({
            where: { userId: user.id, id: { not: id } },
            data: { isDefault: false },
          });
        }
        return tx.address.update({
          where: { id },
          data: {
            label: input.label ?? null,
            fullName: input.fullName,
            phone: input.phone,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 ?? null,
            city: input.city,
            district: input.district,
            postalCode: input.postalCode ?? null,
            country: input.country ?? existing.country,
            isDefault: input.isDefault ?? existing.isDefault,
          },
        });
      });
      return toDto(updated);
    } catch (error) {
      logger.error({ error, userId: user.id, id }, 'Failed to update address');
      throw new AppError('Unable to update address', 500);
    }
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new AppError('Address not found', 404);
    await prisma.address.delete({ where: { id } });
  }
}
