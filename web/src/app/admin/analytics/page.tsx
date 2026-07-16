import Link from 'next/link';
import { AccountCard } from '@/components/features/account/AccountCard';

export const metadata = { title: 'Analytics' };

const REPORTS = [
  {
    href: '/admin/analytics/sales',
    title: 'Sales dashboard',
    description: 'Revenue, orders, AOV, chart, payment method breakdown.',
  },
  {
    href: '/admin/analytics/bestsellers',
    title: 'Best sellers',
    description: 'Top-selling products, filterable by category and date range.',
  },
  {
    href: '/admin/analytics/customers',
    title: 'Customer activity',
    description: 'Signups, repeat rate, top spenders, wishlist trends.',
  },
];

export default function AdminAnalyticsPage() {
  return (
    <AccountCard title="Analytics" subtitle="Reports and exports.">
      <ul className="grid gap-3 md:grid-cols-3">
        {REPORTS.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="block h-full rounded-[12px] border border-brand-line p-4 transition-colors hover:border-brand-indigo hover:bg-brand-cream"
            >
              <div className="text-[1rem] font-bold text-brand-ink">{r.title}</div>
              <div className="mt-1 text-[0.85rem] text-brand-ink-soft">
                {r.description}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AccountCard>
  );
}
