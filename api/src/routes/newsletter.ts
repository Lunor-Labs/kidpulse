import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/EmailService';

const router = Router();
const emailService = new EmailService();

const subscribeSchema = z.object({
  email: z.string().email(),
});

router.get('/banner', async (_req, res) => {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        newsletterHeading: true,
        newsletterSubtext: true,
        newsletterDiscountPct: true,
      },
    });
    return res.json({ data: settings });
  } catch {
    return res.json({ data: null });
  }
});

router.post('/subscribe', async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const { email } = parsed.data;

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true },
      create: { email: email.toLowerCase() },
    });

    const settings = await prisma.adminSettings.findUnique({
      where: { id: 'singleton' },
      select: { newsletterDiscountPct: true },
    });
    emailService
      .sendNewsletterWelcome(email.toLowerCase(), {
        discountPct: settings?.newsletterDiscountPct,
      })
      .catch(() => {});

    return res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] subscribe error:', err);
    return res.status(500).json({ error: 'Failed to subscribe', detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;