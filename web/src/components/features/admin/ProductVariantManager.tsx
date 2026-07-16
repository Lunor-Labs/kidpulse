'use client';

export interface ProductVariantInput {
  id: string | null;
  label: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface ProductVariantManagerProps {
  value: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
}

function numberOrNull(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function ProductVariantManager({ value, onChange }: ProductVariantManagerProps) {
  function update(idx: number, patch: Partial<ProductVariantInput>) {
    onChange(value.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function add() {
    onChange([
      ...value,
      {
        id: null,
        label: '',
        sku: null,
        price: 0,
        compareAtPrice: null,
        stockQuantity: 0,
        imageUrl: null,
        sortOrder: value.length,
        isActive: true,
      },
    ]);
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx).map((v, i) => ({ ...v, sortOrder: i })));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((v, i) => ({ ...v, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-brand-line bg-brand-cream/30 px-4 py-3 text-[0.82rem] text-brand-ink-soft">
          No variants. The product-level price and stock apply. Add variants (e.g. sizes,
          colours, age ranges) to give each its own price and stock.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {value.map((v, idx) => (
            <li
              key={v.id ?? `new-${idx}`}
              className="rounded-[12px] border border-brand-line bg-white p-3"
            >
              <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
                <label className="col-span-2 flex flex-col gap-1 text-[0.72rem] font-semibold text-brand-ink-soft">
                  Label *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red / Large or Ages 4-6"
                    className="rounded-[8px] border border-brand-line px-2 py-1 text-[0.84rem] font-normal text-brand-ink"
                    value={v.label}
                    onChange={(e) => update(idx, { label: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[0.72rem] font-semibold text-brand-ink-soft">
                  SKU
                  <input
                    type="text"
                    className="rounded-[8px] border border-brand-line px-2 py-1 text-[0.84rem] font-normal text-brand-ink"
                    value={v.sku ?? ''}
                    onChange={(e) => update(idx, { sku: e.target.value.trim() || null })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[0.72rem] font-semibold text-brand-ink-soft">
                  Price (LKR) *
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    className="rounded-[8px] border border-brand-line px-2 py-1 text-[0.84rem] font-normal text-brand-ink"
                    value={v.price}
                    onChange={(e) => update(idx, { price: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[0.72rem] font-semibold text-brand-ink-soft">
                  Compare-at
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="rounded-[8px] border border-brand-line px-2 py-1 text-[0.84rem] font-normal text-brand-ink"
                    value={v.compareAtPrice ?? ''}
                    onChange={(e) => update(idx, { compareAtPrice: numberOrNull(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[0.72rem] font-semibold text-brand-ink-soft">
                  Stock *
                  <input
                    type="number"
                    min={0}
                    required
                    className="rounded-[8px] border border-brand-line px-2 py-1 text-[0.84rem] font-normal text-brand-ink"
                    value={v.stockQuantity}
                    onChange={(e) =>
                      update(idx, { stockQuantity: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })
                    }
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-[0.8rem] text-brand-ink">
                  <input
                    type="checkbox"
                    checked={v.isActive}
                    onChange={(e) => update(idx, { isActive: e.target.checked })}
                  />
                  Active (selectable on storefront)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === value.length - 1}
                    className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] text-brand-berry"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="rounded-full border border-brand-line bg-white px-4 py-1.5 text-[0.82rem] font-semibold text-brand-indigo hover:bg-brand-cream"
      >
        + Add variant
      </button>
    </div>
  );
}
