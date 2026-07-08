'use client';

interface Category {
  slug: string;
  name: string;
  productCount: number;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategories: string[];
  maxPrice: number;
  selectedMinAge: number | null;
  selectedMaxAge: number | null;
  onCategoryChange: (slug: string, checked: boolean) => void;
  onMaxPriceChange: (value: number) => void;
  onAgeChange: (minAge: number | null, maxAge: number | null) => void;
}

const AGE_GROUPS = [
  { label: 'Ages 3–6',  minAge: 3,  maxAge: 6  },
  { label: 'Ages 6–9',  minAge: 6,  maxAge: 9  },
  { label: 'Ages 9–12', minAge: 9,  maxAge: 12 },
  { label: 'Ages 12+',  minAge: 12, maxAge: 99 },
];

const MAX_PRICE = 15000;

function formatPrice(val: number) {
  return `Rs. ${val.toLocaleString('en-LK')}`;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  maxPrice,
  selectedMinAge,
  selectedMaxAge,
  onCategoryChange,
  onMaxPriceChange,
  onAgeChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-[220px] shrink-0">
      <div className="sticky top-[80px] rounded-[18px] border border-brand-line bg-white p-5">

        {/* ── Category ── */}
        <div className="mb-5">
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
            Category
          </h3>
          <div className="flex flex-col gap-[10px]">
            {categories.map((c) => (
              <label
                key={c.slug}
                className="flex cursor-pointer items-center gap-[10px] text-[0.88rem] text-brand-ink"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.slug)}
                  onChange={(e) => onCategoryChange(c.slug, e.target.checked)}
                  className="h-[14px] w-[14px] cursor-pointer accent-brand-indigo"
                />
                <span className="flex-1">{c.name}</span>
                <span className="text-[0.74rem] text-brand-ink-soft">
                  {c.productCount}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="my-5 h-px bg-brand-line" />

        {/* ── Price Range ── */}
        <div className="mb-5">
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
            Price Range
          </h3>
          <p className="mb-2 text-[0.82rem] font-bold text-brand-indigo">
            {formatPrice(0)} — {formatPrice(maxPrice)}
            {maxPrice === MAX_PRICE && '+'}
          </p>
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={500}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="w-full accent-brand-indigo"
          />
          <div className="mt-1 flex justify-between text-[0.72rem] text-brand-ink-soft">
            <span>Rs. 0</span>
            <span>Rs. 15,000+</span>
          </div>
        </div>

        <div className="my-5 h-px bg-brand-line" />

        {/* ── Age Group ── */}
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
            Age Group
          </h3>
          <div className="flex flex-col gap-[10px]">
            {AGE_GROUPS.map((ag) => {
              const isSelected =
                selectedMinAge === ag.minAge && selectedMaxAge === ag.maxAge;
              return (
                <label
                  key={ag.label}
                  className="flex cursor-pointer items-center gap-[10px] text-[0.88rem] text-brand-ink"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onAgeChange(
                        e.target.checked ? ag.minAge : null,
                        e.target.checked ? ag.maxAge : null
                      )
                    }
                    className="h-[14px] w-[14px] cursor-pointer accent-brand-indigo"
                  />
                  {ag.label}
                </label>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
}