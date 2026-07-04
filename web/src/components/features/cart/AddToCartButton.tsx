'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types/catalog';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Button className="w-full" onClick={handleAdd} disabled={product.stockQuantity === 0}>
      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
}
