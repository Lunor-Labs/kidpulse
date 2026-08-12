import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  stageOptionIds: string[] | null; // Stage-2 option ids for multi-stage items
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

function sameLine(item: CartItem, productId: string, variantId: string | null, stageOptionIds: string[] | null) {
  if (item.productId !== productId) return false;
  if ((item.variantId ?? null) !== (variantId ?? null)) return false;
  // For multi-stage items, treat same selection as same line
  if (stageOptionIds && item.stageOptionIds) {
    return (
      stageOptionIds.length === item.stageOptionIds.length &&
      stageOptionIds.every((id) => item.stageOptionIds!.includes(id))
    );
  }
  return !stageOptionIds && !item.stageOptionIds;
}

interface CartState {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, 'quantity' | 'variantId' | 'variantLabel' | 'stageOptionIds'> &
      Partial<Pick<CartItem, 'variantId' | 'variantLabel' | 'stageOptionIds'>>,
    quantity?: number
  ) => void;
  removeItem: (productId: string, variantId?: string | null, stageOptionIds?: string[] | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number, stageOptionIds?: string[] | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const variantId = item.variantId ?? null;
          const stageOptionIds = item.stageOptionIds ?? null;
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, variantId, stageOptionIds)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, variantId, stageOptionIds)
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
                stageOptionIds,
                quantity,
              },
            ],
          };
        }),
      removeItem: (productId, variantId = null, stageOptionIds = null) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, productId, variantId ?? null, stageOptionIds ?? null)
          ),
        })),
      updateQuantity: (productId, variantId, quantity, stageOptionIds = null) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !sameLine(i, productId, variantId, stageOptionIds ?? null)
                )
              : state.items.map((i) =>
                  sameLine(i, productId, variantId, stageOptionIds ?? null)
                    ? { ...i, quantity }
                    : i
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