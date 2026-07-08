'use client';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (qty: number) => void;
}

export function QuantitySelector({
  quantity,
  maxQuantity,
  onChange,
}: QuantitySelectorProps) {
  return (
    <div className="mb-5">
      <h3 className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
        Quantity
      </h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-brand-line bg-white text-lg font-bold text-brand-indigo transition-colors hover:border-brand-indigo disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[32px] text-center text-[1rem] font-bold text-brand-ink">
          {quantity}
        </span>
        <button
          onClick={() => onChange(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-brand-line bg-white text-lg font-bold text-brand-indigo transition-colors hover:border-brand-indigo disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
        {maxQuantity <= 5 && maxQuantity > 0 && (
          <span className="text-[0.78rem] font-semibold text-brand-berry">
            Only {maxQuantity} left!
          </span>
        )}
      </div>
    </div>
  );
}