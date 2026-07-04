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

  it('updates quantity and removes at zero', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().updateQuantity('p1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity('p1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('counts total quantity across items', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().addItem({ ...kit, productId: 'p2' });
    useCartStore.getState().updateQuantity('p1', 3);
    expect(selectItemCount(useCartStore.getState())).toBe(4);
  });

  it('persists to localStorage', () => {
    useCartStore.getState().addItem(kit);
    expect(localStorage.getItem('kidpulse-cart')).toContain('p1');
  });
});
