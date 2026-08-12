'use client';

import { useEffect, useState } from 'react';

export interface StageOption {
  id: string;
  label: string;
  selectCount?: number | null;
  priceOverride?: number | null;
  stockQuantity: number;
  sortOrder: number;
}

export interface VariantStage {
  id: string;
  stageOrder: number;
  label: string;
  maxSelect: number;
  options: StageOption[];
}

export interface MultiStageSelectorValue {
  stage1OptionId: string;
  stage1Label: string;
  stage2OptionIds: string[];
  stage2Labels: string[];
  priceOverride: number | null;
  displayLabel: string;
}

interface Props {
  stages: VariantStage[];
  onChange: (value: MultiStageSelectorValue | null) => void;
}

export function MultiStageSelector({ stages, onChange }: Props) {
  const stage1 = stages.find((s) => s.stageOrder === 0);
  const stage2 = stages.find((s) => s.stageOrder === 1);

  const [selectedS1Id, setSelectedS1Id] = useState<string | null>(null);
  const [selectedS2Ids, setSelectedS2Ids] = useState<string[]>([]);

  const selectedS1Option = stage1?.options.find((o) => o.id === selectedS1Id) ?? null;
  const requiredPicks = selectedS1Option?.selectCount ?? 0;

  useEffect(() => {
    if (!selectedS1Option || selectedS2Ids.length !== requiredPicks) {
      onChange(null);
      return;
    }
    const s2Labels = selectedS2Ids.map(
      (id) => stage2?.options.find((o) => o.id === id)?.label ?? id
    );
    onChange({
      stage1OptionId: selectedS1Option.id,
      stage1Label: selectedS1Option.label,
      stage2OptionIds: selectedS2Ids,
      stage2Labels: s2Labels,
      priceOverride: selectedS1Option.priceOverride ?? null,
      displayLabel: `${selectedS1Option.label} — ${s2Labels.join(', ')}`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedS1Id, selectedS2Ids]);

  function handleS1Select(optionId: string) {
    setSelectedS1Id(optionId);
    setSelectedS2Ids([]);
  }

  function toggleS2(optionId: string) {
    if (selectedS2Ids.includes(optionId)) {
      setSelectedS2Ids((prev) => prev.filter((id) => id !== optionId));
      return;
    }
    if (selectedS2Ids.length >= requiredPicks) {
      setSelectedS2Ids((prev) => [...prev.slice(1), optionId]);
      return;
    }
    setSelectedS2Ids((prev) => [...prev, optionId]);
  }

  if (!stage1 || !stage2) return null;

  return (
    <div className="space-y-5">
      {/* Stage 1 */}
      <div>
        <div className="mb-2 text-[0.84rem] font-semibold text-brand-ink">
          {stage1.label}
        </div>
        <div className="flex flex-wrap gap-2">
          {stage1.options.map((opt) => {
            const isSelected = selectedS1Id === opt.id;
            const outOfStock = opt.stockQuantity === 0;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={outOfStock}
                onClick={() => handleS1Select(opt.id)}
                className={[
                  'rounded-[10px] border px-4 py-2 text-[0.84rem] font-semibold transition-colors',
                  isSelected
                    ? 'border-brand-indigo bg-brand-indigo text-white'
                    : outOfStock
                    ? 'cursor-not-allowed border-brand-line bg-brand-cream/40 text-brand-ink-soft line-through opacity-60'
                    : 'border-brand-line bg-white text-brand-ink hover:border-brand-indigo hover:text-brand-indigo',
                ].join(' ')}
              >
                {opt.label}
                {opt.priceOverride != null && (
                  <span className="ml-1 text-[0.74rem] font-normal opacity-80">
                    · Rs. {opt.priceOverride.toLocaleString('en-LK')}
                  </span>
                )}
                {outOfStock && (
                  <span className="ml-1 text-[0.72rem] font-normal">· Out of stock</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage 2 — only shown after Stage 1 selected */}
      {selectedS1Option && (
        <div>
          <div className="mb-1 text-[0.84rem] font-semibold text-brand-ink">
            {stage2.label}
          </div>
          <p className="mb-2 text-[0.76rem] text-brand-ink-soft">
            Pick {requiredPicks}{' '}
            {requiredPicks === 1 ? 'character' : 'characters'}
            {selectedS2Ids.length > 0 && (
              <span className="ml-1 font-semibold text-brand-indigo">
                ({selectedS2Ids.length}/{requiredPicks} selected)
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {stage2.options.map((opt) => {
              const isSelected = selectedS2Ids.includes(opt.id);
              const outOfStock = opt.stockQuantity === 0;
              const atLimit = selectedS2Ids.length >= requiredPicks && !isSelected;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => !outOfStock && toggleS2(opt.id)}
                  className={[
                    'rounded-[10px] border px-3 py-2 text-[0.82rem] font-medium transition-colors',
                    isSelected
                      ? 'border-brand-sky-deep bg-brand-sky-deep text-white'
                      : outOfStock
                      ? 'cursor-not-allowed border-brand-line bg-brand-cream/40 text-brand-ink-soft line-through opacity-60'
                      : atLimit
                      ? 'cursor-pointer border-brand-line bg-white text-brand-ink-soft opacity-60 hover:opacity-100'
                      : 'border-brand-line bg-white text-brand-ink hover:border-brand-sky-deep hover:text-brand-sky-deep',
                  ].join(' ')}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt.label}
                  {outOfStock && (
                    <span className="ml-1 text-[0.70rem]">· Out of stock</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedS2Ids.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedS2Ids.map((id) => {
                const opt = stage2.options.find((o) => o.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-sky-deep/10 px-2 py-[2px] text-[0.74rem] font-semibold text-brand-sky-deep"
                  >
                    {opt?.label}
                    <button
                      type="button"
                      onClick={() => toggleS2(id)}
                      className="ml-[2px] text-brand-sky-deep/60 hover:text-brand-sky-deep"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {selectedS2Ids.length === requiredPicks && (
            <p className="mt-2 text-[0.78rem] font-semibold text-brand-olive">
              ✔ Selection complete
            </p>
          )}
        </div>
      )}
    </div>
  );
}