import { discountPercent, formatPrice } from '@/lib/utils';
import { Badge } from './Badge';

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
}

export function PriceTag({ price, compareAtPrice }: PriceTagProps) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-display text-lg font-bold text-brand-indigo">{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-brand-ink-soft line-through">{formatPrice(compareAtPrice)}</span>
          <Badge tone="berry">-{discountPercent(price, compareAtPrice)}%</Badge>
        </>
      )}
    </div>
  );
}
