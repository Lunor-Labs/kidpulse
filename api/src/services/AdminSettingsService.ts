import { prisma } from '../lib/prisma';
import type { AdminSettingsInput } from '../types/adminSchemas';

export interface AdminSettingsDto {
  bankAccountName: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  bankTransferDeadlineDays: number;
  supportEmail: string | null;
  updatedAt: string;
}

export class AdminSettingsService {
  async get(): Promise<AdminSettingsDto> {
    const row = await prisma.adminSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
    return this.toDto(row);
  }

  async update(input: AdminSettingsInput): Promise<AdminSettingsDto> {
    const row = await prisma.adminSettings.upsert({
      where: { id: 'singleton' },
      update: {
        bankAccountName: input.bankAccountName ?? null,
        bankName: input.bankName ?? null,
        bankBranch: input.bankBranch ?? null,
        bankAccountNumber: input.bankAccountNumber ?? null,
        whatsappNumber: input.whatsappNumber ?? null,
        bankTransferDeadlineDays: input.bankTransferDeadlineDays ?? 1,
        supportEmail: input.supportEmail ?? null,
      },
      create: {
        id: 'singleton',
        bankAccountName: input.bankAccountName ?? null,
        bankName: input.bankName ?? null,
        bankBranch: input.bankBranch ?? null,
        bankAccountNumber: input.bankAccountNumber ?? null,
        whatsappNumber: input.whatsappNumber ?? null,
        bankTransferDeadlineDays: input.bankTransferDeadlineDays ?? 1,
        supportEmail: input.supportEmail ?? null,
      },
    });
    return this.toDto(row);
  }

  private toDto(row: {
    bankAccountName: string | null;
    bankName: string | null;
    bankBranch: string | null;
    bankAccountNumber: string | null;
    whatsappNumber: string | null;
    bankTransferDeadlineDays: number;
    supportEmail: string | null;
    updatedAt: Date;
  }): AdminSettingsDto {
    return {
      bankAccountName: row.bankAccountName,
      bankName: row.bankName,
      bankBranch: row.bankBranch,
      bankAccountNumber: row.bankAccountNumber,
      whatsappNumber: row.whatsappNumber,
      bankTransferDeadlineDays: row.bankTransferDeadlineDays,
      supportEmail: row.supportEmail,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
