import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/auth';
import { AppError } from '../lib/AppError';
import { env } from '../config/env';
import { EmailService } from '../services/EmailService';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

const emailService = new EmailService();

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// ── Customer register ─────────────────────────────────────────────────────────

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.userProfile.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError('An account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const profile = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: body.email.toLowerCase(),
        fullName: body.fullName.trim(),
        passwordHash,
      },
    });

    const token = await signToken({
      sub: profile.id,
      email: profile.email,
      role: 'customer',
      fullName: profile.fullName,
    });

    res.status(201).json({ data: { token } });
  } catch (err) {
    next(err);
  }
});

// ── Login (customer + staff) ──────────────────────────────────────────────────

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const email = body.email.toLowerCase();

    // Check staff first
    const staff = await prisma.staffUser.findUnique({ where: { email } });
    if (staff) {
      if (!staff.isActive) throw new AppError('Account is disabled', 403);
      const valid = await bcrypt.compare(body.password, staff.passwordHash);
      if (!valid) throw new AppError('Invalid email or password', 401);

      const token = await signToken({
        sub: staff.id,
        email: staff.email,
        role: staff.role as 'staff' | 'super_admin',
        fullName: staff.fullName,
      });
      res.json({ data: { token, role: staff.role } });
      return;
    }

    // Check customer
    const customer = await prisma.userProfile.findUnique({ where: { email } });
    if (!customer || !customer.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(body.password, customer.passwordHash);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = await signToken({
      sub: customer.id,
      email: customer.email,
      role: 'customer',
      fullName: customer.fullName,
    });

    res.json({ data: { token, role: 'customer' } });
  } catch (err) {
    next(err);
  }
});

// ── Forgot password ───────────────────────────────────────────────────────────

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const body = forgotSchema.parse(req.body);
    const email = body.email.toLowerCase();

    // Always respond with success to prevent email enumeration
    res.json({ data: { message: 'If an account exists, a reset link has been sent.' } });

    const customer = await prisma.userProfile.findUnique({ where: { email } });
    const staff = await prisma.staffUser.findUnique({ where: { email } });
    if (!customer && !staff) return;

    await prisma.passwordResetToken.deleteMany({
      where: { email, usedAt: null },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetUrl = `${env.WEB_BASE_URL}/reset-password?token=${token}`;

    // TODO: wire up email once sendPasswordReset is added to EmailService
    console.log(`Password reset link for ${email}: ${resetUrl}`);
  } catch (err) {
    next(err);
  }
});

// ── Reset password ────────────────────────────────────────────────────────────

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const body = resetSchema.parse(req.body);

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: body.token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError('Reset link is invalid or has expired', 400);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const staff = await prisma.staffUser.findUnique({ where: { email: record.email } });
    if (staff) {
      await prisma.staffUser.update({
        where: { email: record.email },
        data: { passwordHash },
      });
    } else {
      await prisma.userProfile.update({
        where: { email: record.email },
        data: { passwordHash },
      });
    }

    await prisma.passwordResetToken.update({
      where: { token: body.token },
      data: { usedAt: new Date() },
    });

    res.json({ data: { message: 'Password updated successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ── Change password (logged in) ───────────────────────────────────────────────

authRouter.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const body = changePasswordSchema.parse(req.body);
    const user = req.user!;

    const staff = await prisma.staffUser.findUnique({ where: { id: user.id } });
    if (staff) {
      const valid = await bcrypt.compare(body.currentPassword, staff.passwordHash);
      if (!valid) throw new AppError('Current password is incorrect', 401);
      const passwordHash = await bcrypt.hash(body.newPassword, 12);
      await prisma.staffUser.update({ where: { id: user.id }, data: { passwordHash } });
      res.json({ data: { message: 'Password updated.' } });
      return;
    }

    const customer = await prisma.userProfile.findUnique({ where: { id: user.id } });
    if (!customer?.passwordHash) throw new AppError('Account not found', 404);

    const valid = await bcrypt.compare(body.currentPassword, customer.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ data: { message: 'Password updated.' } });
  } catch (err) {
    next(err);
  }
});

// ── Get current user ──────────────────────────────────────────────────────────

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({ data: { user: req.user } });
  } catch (err) {
    next(err);
  }
});