import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StageSelection {
  optionId: string;
  quantity: number;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  stageSelections: StageSelection[] | null;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

function sameLine(
  item: CartItem,
  productId: string,
  variantId: string | null,
  stageSelections: StageSelection[] | null
) {
  if (item.productId !== productId) return false;
  if ((item.variantId ?? null) !== (variantId ?? null)) return false;
  if (stageSelections && item.stageSelections) {
    if (stageSelections.length !== item.stageSelections.length) return false;
    return stageSelections.every((sel) => {
      const match = item.stageSelections!.find((s) => s.optionId === sel.optionId);
      return match && match.quantity === sel.quantity;
    });
  }
  return !stageSelections && !item.stageSelections;
}

interface CartState {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, 'quantity' | 'variantId' | 'variantLabel' | 'stageSelections'> &
      Partial<Pick<CartItem, 'variantId' | 'variantLabel' | 'stageSelections'>>,
    quantity?: number
  ) => void;
  removeItem: (productId: string, variantId?: string | null, stageSelections?: StageSelection[] | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number, stageSelections?: StageSelection[] | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const variantId = item.variantId ?? null;
          const stageSelections = item.stageSelections ?? null;
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, variantId, stageSelections)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, variantId, stageSelections)
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
                stageSelections,
                quantity,
              },
            ],
          };
        }),
      removeItem: (productId, variantId = null, stageSelections = null) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, productId, variantId ?? null, stageSelections ?? null)
          ),
        })),
      updateQuantity: (productId, variantId, quantity, stageSelections = null) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !sameLine(i, productId, variantId, stageSelections ?? null)
                )
              : state.items.map((i) =>
                  sameLine(i, productId, variantId, stageSelections ?? null)
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