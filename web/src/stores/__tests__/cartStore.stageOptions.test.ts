import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '../cartStore';

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe('cartStore stage options', () => {
  it('keeps items with different stage-1 options on separate lines', () => {
    const item = {
      productId: 'product-1',
      name: 'Paint Kit',
      price: 800,
      imageUrl: null,
      shippingCost: null,
      stageSelections: [{ optionId: 'character-1', quantity: 1 }],
    };

    useCartStore.getState().addItem({ ...item, stage1OptionId: 'size-small' });
    useCartStore.getState().addItem({ ...item, stage1OptionId: 'size-large' });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(items.map((cartItem) => cartItem.stage1OptionId)).toEqual([
      'size-small',
      'size-large',
    ]);
  });
});
