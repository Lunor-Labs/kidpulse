import { Prisma } from '@prisma/client';

const mockProductFindMany = jest.fn();
const mockStageOptionFindMany = jest.fn();

jest.mock('../../lib/prisma', () => ({
  prisma: {
    product: { findMany: mockProductFindMany },
    variantStageOption: { findMany: mockStageOptionFindMany },
  },
}));

import { OrderService } from '../OrderService';

describe('OrderService.priceItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects stage selections without their pack option', async () => {
    mockProductFindMany.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Paint Kit',
        price: new Prisma.Decimal(800),
        variants: [],
        images: [],
        categoryId: 'category-1',
        sku: 'KIT-1',
        stockQuantity: 10,
        lowStockAlert: 2,
      },
    ]);
    mockStageOptionFindMany.mockResolvedValue([]);

    const service = new OrderService();

    await expect(
      service['priceItems']([
        {
          productId: 'product-1',
          stageSelections: [{ optionId: 'character-option', quantity: 1 }],
          quantity: 1,
        },
      ])
    ).rejects.toThrow('Please reselect the pack');
  });

  it('uses the selected stage-1 option price override', async () => {
    mockProductFindMany.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Paint Kit',
        price: new Prisma.Decimal(800),
        variants: [],
        images: [],
        categoryId: 'category-1',
        sku: 'KIT-1',
        stockQuantity: 10,
        lowStockAlert: 2,
      },
    ]);
    mockStageOptionFindMany.mockResolvedValue([
      {
        id: 'size-option',
        stockQuantity: 10,
        label: 'Large Pack',
        priceOverride: new Prisma.Decimal(1200),
        stage: { productId: 'product-1', stageOrder: 1 },
      },
      {
        id: 'character-option',
        stockQuantity: 5,
        label: 'Blue',
        priceOverride: null,
        stage: { productId: 'product-1', stageOrder: 2 },
      },
    ]);

    const service = new OrderService();
    const result = await service['priceItems']([
      {
        productId: 'product-1',
        stage1OptionId: 'size-option',
        stageSelections: [{ optionId: 'character-option', quantity: 1 }],
        quantity: 1,
      },
    ]);

    expect(result.items[0].price).toBe(1200);
    expect(result.subtotal).toBe(1200);
  });
});
