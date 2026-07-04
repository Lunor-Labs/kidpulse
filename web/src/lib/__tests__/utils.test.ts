import { describe, expect, it } from 'vitest';
import { discountPercent, formatPrice } from '../utils';

describe('formatPrice', () => {
  it('formats LKR with thousands separators', () => {
    expect(formatPrice(2500)).toBe('Rs. 2,500');
    expect(formatPrice(12690)).toBe('Rs. 12,690');
  });
});

describe('discountPercent', () => {
  it('rounds to whole percent', () => {
    expect(discountPercent(2500, 12690)).toBe(80);
    expect(discountPercent(5100, 8500)).toBe(40);
  });
});
