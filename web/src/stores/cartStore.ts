import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

function sameLine(item: CartItem, productId: string, variantId: string | null) {
  return item.productId === productId && (item.variantId ?? null) === (variantId ?? null);
}

interface CartState {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, 'quantity' | 'variantId' | 'variantLabel'> &
      Partial<Pick<CartItem, 'variantId' | 'variantLabel'>>,
    quantity?: number
  ) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const variantId = item.variantId ?? null;
          const existing = state.items.find((i) => sameLine(i, item.productId, variantId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, variantId)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                variantId,
                variantLabel: item.variantLabel ?? null,
                quantity,
              },
            ],
          };
        }),
      removeItem: (productId, variantId = null) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameLine(i, productId, variantId))
              : state.items.map((i) =>
                  sameLine(i, productId, variantId) ? { ...i, quantity } : i
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'kidpulse-cart' }
  )
);

export function selectItemCount(state: { items: CartItem[] }): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}
