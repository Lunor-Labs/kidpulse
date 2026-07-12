import { beforeEach, describe, expect, it } from 'vitest';
import { selectItemCount, useCartStore } from '../cartStore';

const kit = { productId: 'p1', name: '3 Char Kit', price: 2500, imageUrl: null };

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe('cartStore', () => {
  it('adds items and merges duplicates by productId', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().addItem(kit);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('adds the requested quantity', () => {
    useCartStore.getState().addItem(kit, 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    useCartStore.getState().addItem(kit, 2);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('keeps separate lines per variant of the same product', () => {
    useCartStore.getState().addItem({ ...kit, variantId: 'v1', variantLabel: 'Red' });
    useCartStore.getState().addItem({ ...kit, variantId: 'v2', variantLabel: 'Blue' });
    useCartStore.getState().addItem(kit);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(3);
  });

  it('merges duplicates of the same variant', () => {
    useCartStore.getState().addItem({ ...kit, variantId: 'v1', variantLabel: 'Red' });
    useCartStore.getState().addItem({ ...kit, variantId: 'v1', variantLabel: 'Red' });
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('updates quantity and removes at zero', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().updateQuantity('p1', null, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity('p1', null, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates and removes variant lines independently', () => {
    useCartStore.getState().addItem({ ...kit, variantId: 'v1', variantLabel: 'Red' });
    useCartStore.getState().addItem({ ...kit, variantId: 'v2', variantLabel: 'Blue' });
    useCartStore.getState().updateQuantity('p1', 'v1', 4);
    const { items } = useCartStore.getState();
    expect(items.find((i) => i.variantId === 'v1')?.quantity).toBe(4);
    expect(items.find((i) => i.variantId === 'v2')?.quantity).toBe(1);
    useCartStore.getState().removeItem('p1', 'v2');
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('counts total quantity across items', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().addItem({ ...kit, productId: 'p2' });
    useCartStore.getState().updateQuantity('p1', null, 3);
    expect(selectItemCount(useCartStore.getState())).toBe(4);
  });

  it('persists to localStorage', () => {
    useCartStore.getState().addItem(kit);
    expect(localStorage.getItem('kidpulse-cart')).toContain('p1');
  });
});
