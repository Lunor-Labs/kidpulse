import { prisma } from '../src/lib/prisma';

async function main() {
  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off your first order',
      type: 'PERCENT',
      value: 10,
    },
    {
      code: 'SHIP500',
      description: 'LKR 500 off orders over LKR 3000',
      type: 'FIXED',
      value: 500,
      minSubtotal: 3000,
    },
  ] as const;

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        description: c.description,
        type: c.type,
        value: c.value,
        minSubtotal: 'minSubtotal' in c ? c.minSubtotal : null,
        isActive: true,
        deletedAt: null,
      },
      create: {
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value,
        minSubtotal: 'minSubtotal' in c ? c.minSubtotal : null,
        isActive: true,
      },
    });
    console.log(`✓ ${c.code} — ${c.description}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
