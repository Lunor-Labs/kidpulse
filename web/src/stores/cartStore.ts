import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StageSelection {
  optionId: string;
  quantity: number;
}

export interface CartItem {
  cartKey: string;
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  stage1OptionId: string | null;
  stageSelections: StageSelection[] | null;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  shippingCost: number | null;
}

function generateCartKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sameLine(
  item: CartItem,
  productId: string,
  variantId: string | null,
  stage1OptionId: string | null,
  stageSelections: StageSelection[] | null
) {
  if (item.productId !== productId) return false;
  if ((item.variantId ?? null) !== (variantId ?? null)) return false;
  if ((item.stage1OptionId ?? null) !== (stage1OptionId ?? null)) return false;
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
    item: Omit<CartItem, 'quantity' | 'cartKey' | 'variantId' | 'variantLabel' | 'stage1OptionId' | 'stageSelections'> &
      Partial<Pick<CartItem, 'variantId' | 'variantLabel' | 'stage1OptionId' | 'stageSelections'>>,
    quantity?: number
  ) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const variantId = item.variantId ?? null;
          const stage1OptionId = item.stage1OptionId ?? null;
          const stageSelections = item.stageSelections ?? null;
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, variantId, stage1OptionId, stageSelections)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === existing.cartKey
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
                cartKey: generateCartKey(),
                variantId,
                variantLabel: item.variantLabel ?? null,
                stage1OptionId,
                stageSelections,
                quantity,
              },
            ],
          };
        }),

      removeItem: (cartKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartKey !== cartKey),
        })),

      updateQuantity: (cartKey, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.cartKey !== cartKey)
              : state.items.map((i) =>
                  i.cartKey === cartKey ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'kidpulse-cart',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          // Normalize fields added after older carts were persisted.
          return {
            ...persistedState,
            items: (persistedState.items ?? []).map((item: any) => ({
              ...item,
              cartKey: item.cartKey ?? generateCartKey(),
              shippingCost: item.shippingCost ?? null,
              stage1OptionId: item.stage1OptionId ?? null,
            })),
          };
        }
        return persistedState as CartState;
      },
    }
  )
);

export function selectItemCount(state: { items: CartItem[] }): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}