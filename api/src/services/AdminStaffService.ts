import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/AppError';

export type StaffRole = 'staff' | 'super_admin';

export interface StaffRow {
  id: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export class AdminStaffService {
  async list(): Promise<StaffRow[]> {
    const users = await prisma.staffUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.toRow);
  }

  async create(body: {
    email: string;
    password: string;
    fullName?: string | null;
    role: StaffRole;
  }): Promise<StaffRow> {
    const existing = await prisma.staffUser.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      throw new AppError('A staff account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.staffUser.create({
      data: {
        email: body.email,
        passwordHash,
        fullName: body.fullName ?? null,
        role: body.role,
        isActive: true,
      },
    });

    return this.toRow(user);
  }

  async updateRole(id: string, role: StaffRole): Promise<StaffRow> {
    const existing = await prisma.staffUser.findUnique({ where: { id } });
    if (!existing) throw new AppError('Staff member not found', 404);

    const user = await prisma.staffUser.update({
      where: { id },
      data: { role },
    });

    return this.toRow(user);
  }

  async setActive(id: string, active: boolean): Promise<StaffRow> {
    const existing = await prisma.staffUser.findUnique({ where: { id } });
    if (!existing) throw new AppError('Staff member not found', 404);

    const user = await prisma.staffUser.update({
      where: { id },
      data: { isActive: active },
    });

    return this.toRow(user);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.staffUser.findUnique({ where: { id } });
    if (!existing) throw new AppError('Staff member not found', 404);

    await prisma.staffUser.delete({ where: { id } });
  }

  private toRow(user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
  }): StaffRow {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as StaffRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}