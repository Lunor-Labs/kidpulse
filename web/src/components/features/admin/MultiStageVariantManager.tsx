'use client';

import { inputClass } from './FormField';

export interface StageOptionFormValue {
  id?: string | null;
  label: string;
  selectCount?: number | null;
  priceOverride?: number | null;
  stockQuantity: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface VariantStageFormValue {
  id?: string | null;
  stageOrder: number;
  label: string;
  maxSelect: number;
  options: StageOptionFormValue[];
}

interface Props {
  value: VariantStageFormValue[];
  onChange: (stages: VariantStageFormValue[]) => void;
}

function defaultStages(): VariantStageFormValue[] {
  return [
    {
      stageOrder: 0,
      label: 'Pack Size',
      maxSelect: 1,
      options: [{ label: '1 Pack', selectCount: 1, priceOverride: null, stockQuantity: 0, isActive: true }],
    },
    {
      stageOrder: 1,
      label: 'Characters',
      maxSelect: 1,
      options: [],
    },
  ];
}

export function MultiStageVariantManager({ value, onChange }: Props) {
  // ✅ Fix: was `value.length === 2` which reset saved data to defaults on any
  // re-render where both stages weren't loaded yet. Now only falls back when
  // truly empty (first-time toggle).
  const stages = value.length > 0 ? value : defaultStages();

  function updateStage(stageIdx: number, patch: Partial<VariantStageFormValue>) {
    onChange(stages.map((s, i) => (i === stageIdx ? { ...s, ...patch } : s)));
  }

  function updateOption(stageIdx: number, optIdx: number, patch: Partial<StageOptionFormValue>) {
    const next = stages.map((s, si) => {
      if (si !== stageIdx) return s;
      return { ...s, options: s.options.map((o, oi) => (oi === optIdx ? { ...o, ...patch } : o)) };
    });
    onChange(next);
  }

  function addOption(stageIdx: number) {
    const next = stages.map((s, si) => {
      if (si !== stageIdx) return s;
      const newOpt: StageOptionFormValue =
        stageIdx === 0
          ? { label: '', selectCount: 1, priceOverride: null, stockQuantity: 0, isActive: true }
          : { label: '', stockQuantity: 0, isActive: true };
      return { ...s, options: [...s.options, newOpt] };
    });
    onChange(next);
  }

  function removeOption(stageIdx: number, optIdx: number) {
    const next = stages.map((s, si) => {
      if (si !== stageIdx) return s;
      return { ...s, options: s.options.filter((_, i) => i !== optIdx) };
    });
    onChange(next);
  }

  function handleS1OptionChange(optIdx: number, patch: Partial<StageOptionFormValue>) {
    const next = stages.map((s, si) => {
      if (si !== 0) return s;
      const opts = s.options.map((o, oi) => (oi === optIdx ? { ...o, ...patch } : o));
      return { ...s, options: opts };
    });
    // Keep stage 2 maxSelect in sync with highest selectCount across all Stage 1 options
    const stage1 = next[0];
    const maxCount = Math.max(1, ...stage1.options.map((o) => o.selectCount ?? 1));
    next[1] = { ...next[1], maxSelect: maxCount };
    onChange(next);
  }

  const stage1 = stages[0];
  const stage2 = stages[1];

  return (
    <div className="space-y-4">
      {/* Stage 1 */}
      <div className="rounded-[12px] border border-brand-indigo/20 bg-brand-indigo/[0.03] p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-[0.72rem] font-bold text-white">
            1
          </span>
          <div className="flex-1">
            <p className="mb-1 text-[0.78rem] font-semibold text-brand-ink-soft">Stage 1 label</p>
            <input
              className={inputClass}
              value={stage1.label}
              onChange={(e) => updateStage(0, { label: e.target.value })}
              placeholder="e.g. Character Pack Size"
            />
          </div>
        </div>

        <div className="space-y-2">
          {stage1.options.map((opt, oi) => (
            <div key={oi} className="grid grid-cols-[1fr_100px_100px_32px] items-end gap-2">
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Option label</p>}
                <input
                  className={inputClass}
                  value={opt.label}
                  onChange={(e) => handleS1OptionChange(oi, { label: e.target.value })}
                  placeholder="e.g. 2 Character Pack"
                />
              </div>
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Picks from Stage 2</p>}
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={inputClass}
                  value={opt.selectCount ?? 1}
                  onChange={(e) => handleS1OptionChange(oi, { selectCount: Number(e.target.value) || 1 })}
                />
              </div>
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Price (LKR)</p>}
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={opt.priceOverride ?? ''}
                  onChange={(e) =>
                    handleS1OptionChange(oi, {
                      priceOverride: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="Base price"
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(0, oi)}
                className="flex h-9 w-8 items-center justify-center rounded-[8px] border border-brand-line text-brand-berry hover:bg-brand-cream"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addOption(0)}
          className="mt-3 rounded-full border border-brand-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          + Add pack size option
        </button>
      </div>

      {/* Stage 2 */}
      <div className="rounded-[12px] border border-brand-sky-deep/20 bg-brand-sky-deep/[0.03] p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-sky-deep text-[0.72rem] font-bold text-white">
            2
          </span>
          <div className="flex-1">
            <p className="mb-1 text-[0.78rem] font-semibold text-brand-ink-soft">Stage 2 label</p>
            <input
              className={inputClass}
              value={stage2.label}
              onChange={(e) => updateStage(1, { label: e.target.value })}
              placeholder="e.g. Characters"
            />
          </div>
        </div>

        <p className="mb-2 text-[0.74rem] text-brand-ink-soft">
          Stock is tracked per item. Customer picks the number of items matching their Stage 1 selection.
        </p>

        <div className="space-y-2">
          {stage2.options.map((opt, oi) => (
            <div key={oi} className="grid grid-cols-[1fr_110px_32px] items-end gap-2">
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Item label</p>}
                <input
                  className={inputClass}
                  value={opt.label}
                  onChange={(e) => updateOption(1, oi, { label: e.target.value })}
                  placeholder="e.g. Spiderman"
                />
              </div>
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Stock qty</p>}
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={opt.stockQuantity}
                  onChange={(e) => updateOption(1, oi, { stockQuantity: Number(e.target.value) || 0 })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(1, oi)}
                className="flex h-9 w-8 items-center justify-center rounded-[8px] border border-brand-line text-brand-berry hover:bg-brand-cream"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addOption(1)}
          className="mt-3 rounded-full border border-brand-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          + Add item
        </button>
      </div>
    </div>
  );
}