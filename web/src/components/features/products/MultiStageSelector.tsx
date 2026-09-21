'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { StageSelection } from '@/stores/cartStore';

export interface StageOption {
  id: string;
  label: string;
  selectCount?: number | null;
  priceOverride?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  sortOrder: number;
}

export type VariantStageOption = StageOption;

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
  stageSelections: StageSelection[];
  priceOverride: number | null;
  displayLabel: string;
}

interface Props {
  stages: VariantStage[];
  onAddPack: (value: MultiStageSelectorValue) => void;
  onRemovePack?: (index: number) => void; // ✅ new
  onStage1Select?: (option: StageOption | null) => void;
}

function CharacterPicker({
  stage2,
  packSize,
  onConfirm,
  onBack,
}: {
  stage2: VariantStage;
  packSize: number;
  onConfirm: (selections: StageSelection[]) => void;
  onBack: () => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);
  const remaining = packSize - totalSelected;

  function setQty(optionId: string, qty: number) {
    const opt = stage2.options.find((o) => o.id === optionId);
    if (!opt) return;
    const newQty = Math.max(0, Math.min(qty, Math.min(opt.stockQuantity, packSize)));
    const newTotalWithout = totalSelected - (quantities[optionId] ?? 0);
    const canAdd = packSize - newTotalWithout;
    const finalQty = Math.min(newQty, canAdd);
    setQuantities((prev) => ({ ...prev, [optionId]: finalQty }));
  }

  function handleConfirm() {
    const selections: StageSelection[] = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([optionId, quantity]) => ({ optionId, quantity }));
    onConfirm(selections);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.84rem] font-semibold text-brand-ink">{stage2.label}</p>
        <span className={`text-[0.78rem] font-semibold ${remaining === 0 ? 'text-brand-olive' : 'text-brand-indigo'}`}>
          {remaining === 0 ? '✔ Pack complete' : `${totalSelected}/${packSize} selected`}
        </span>
      </div>

      <p className="text-[0.74rem] text-brand-ink-soft">
        Set the quantity for each character. Total must equal {packSize}.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {stage2.options.map((opt) => {
          const qty = quantities[opt.id] ?? 0;
          const outOfStock = opt.stockQuantity === 0;
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 rounded-[12px] border p-2.5 transition-colors ${
                qty > 0
                  ? 'border-brand-sky-deep bg-brand-sky-deep/5'
                  : outOfStock
                  ? 'border-brand-line bg-brand-cream/30 opacity-50'
                  : 'border-brand-line bg-white'
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[8px] bg-brand-cream/60">
                {opt.imageUrl ? (
                  <Image src={opt.imageUrl} alt={opt.label} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[1.4rem]">🎨</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-[0.84rem] font-semibold text-brand-ink">{opt.label}</p>
                {outOfStock && (
                  <p className="text-[0.7rem] text-brand-berry font-semibold">Out of stock</p>
                )}
              </div>

              {!outOfStock && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(opt.id, qty - 1)}
                    disabled={qty === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-line text-[0.9rem] font-bold text-brand-ink hover:bg-brand-cream disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[0.86rem] font-bold text-brand-ink">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(opt.id, qty + 1)}
                    disabled={remaining === 0 || qty >= opt.stockQuantity}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-line text-[0.9rem] font-bold text-brand-ink hover:bg-brand-cream disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.84rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={remaining !== 0}
          onClick={handleConfirm}
          className="flex-1 rounded-full bg-brand-indigo px-4 py-2 text-[0.84rem] font-bold text-white hover:bg-brand-indigo/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {remaining === 0 ? '✔ Add this pack' : `Select ${remaining} more`}
        </button>
      </div>
    </div>
  );
}

export function MultiStageSelector({ stages, onAddPack, onRemovePack, onStage1Select }: Props) {
  const stage1 = stages.find((s) => s.stageOrder === 0);
  const stage2 = stages.find((s) => s.stageOrder === 1);

  const [selectedS1Id, setSelectedS1Id] = useState<string | null>(null);
  const [step, setStep] = useState<'pack' | 'characters'>('pack');
  const [addedPacks, setAddedPacks] = useState<MultiStageSelectorValue[]>([]);

  const selectedS1Option = stage1?.options.find((o) => o.id === selectedS1Id) ?? null;
  const packSize = selectedS1Option?.selectCount ?? 0;

  const inStockS2Count = stage2?.options.filter((o) => o.stockQuantity > 0).length ?? 0;

  function handlePackSelect(optionId: string) {
    const option = stage1?.options.find((o) => o.id === optionId) ?? null;
    setSelectedS1Id(optionId);
    setStep('characters');
    onStage1Select?.(option);
  }

  function handleBack() {
    setSelectedS1Id(null);
    setStep('pack');
    onStage1Select?.(null);
  }

  function handleCharactersConfirm(selections: StageSelection[]) {
    if (!selectedS1Option) return;
    const labels = selections.map((sel) => {
      const opt = stage2?.options.find((o) => o.id === sel.optionId);
      return sel.quantity > 1 ? `${opt?.label} ×${sel.quantity}` : (opt?.label ?? sel.optionId);
    });
    const pack: MultiStageSelectorValue = {
      stage1OptionId: selectedS1Option.id,
      stage1Label: selectedS1Option.label,
      stageSelections: selections,
      priceOverride: selectedS1Option.priceOverride ?? null,
      displayLabel: `${selectedS1Option.label} — ${labels.join(', ')}`,
    };
    setAddedPacks((prev) => [...prev, pack]);
    onAddPack(pack);
    setSelectedS1Id(null);
    setStep('pack');
    onStage1Select?.(null);
  }

  if (!stage1 || !stage2) return null;

  return (
    <div className="space-y-4">
      {/* Added packs summary */}
      {addedPacks.length > 0 && (
        <div className="space-y-1">
          {addedPacks.map((pack, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-[10px] bg-brand-olive/10 px-3 py-2 text-[0.78rem]"
            >
              <span className="text-brand-olive">✔</span>
              <span className="font-semibold text-brand-ink">{pack.stage1Label}</span>
              <span className="text-brand-ink-soft">—</span>
              <span className="text-brand-ink-soft truncate">
                {pack.stageSelections.map((sel) => {
                  const opt = stage2.options.find((o) => o.id === sel.optionId);
                  return sel.quantity > 1 ? `${opt?.label} ×${sel.quantity}` : opt?.label;
                }).join(', ')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAddedPacks((prev) => prev.filter((_, pi) => pi !== i));
                  onRemovePack?.(i); // ✅ tell parent to remove at same index
                }}
                className="ml-auto shrink-0 text-brand-ink-soft hover:text-brand-berry"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 'pack' && (
        <div>
          <p className="mb-2 text-[0.84rem] font-semibold text-brand-ink">
            {addedPacks.length > 0 ? `Add another ${stage1.label}` : stage1.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {stage1.options.map((opt) => {
              const required = opt.selectCount ?? 1;
              const outOfStock = inStockS2Count < required;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => handlePackSelect(opt.id)}
                  className={[
                    'rounded-[10px] border px-4 py-2 text-[0.84rem] font-semibold transition-colors',
                    outOfStock
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
                  {outOfStock && <span className="ml-1 text-[0.72rem] font-normal">· Out of stock</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 'characters' && selectedS1Option && (
        <CharacterPicker
          stage2={stage2}
          packSize={packSize}
          onConfirm={handleCharactersConfirm}
          onBack={handleBack}
        />
      )}
    </div>
  );
}