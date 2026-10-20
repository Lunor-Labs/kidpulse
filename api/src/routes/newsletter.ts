import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const subscribeSchema = z.object({
  email: z.string().email(),
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
    return res.json({ ok: true });
    } catch (err) {
    console.error('[newsletter] subscribe error:', err);
    return res.status(500).json({ error: 'Failed to subscribe', detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;