'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { toast } from 'sonner';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import { inputClass } from './FormField';

export interface StageOptionFormValue {
  id?: string | null;
  label: string;
  selectCount?: number | null;
  priceOverride?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
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

function CharacterImageUpload({
  imageUrl,
  onUpload,
}: {
  imageUrl?: string | null;
  onUpload: (url: string) => void;
}) {
  const token = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image too large. Max 4MB.');
      return;
    }
    try {
      const dataBase64 = await fileToBase64(file);
      const result = await adminApi.uploadImage(
        { filename: file.name, contentType: file.type, dataBase64, folder: 'products' },
        token
      );
      onUpload(result.url);
      toast.success('Character image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border-2 border-dashed border-brand-line bg-brand-cream/40 hover:border-brand-indigo transition-colors"
        title="Upload character image"
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="Character" fill sizes="48px" className="object-cover" />
        ) : (
          <span className="text-[1.1rem] text-brand-ink-soft">🖼</span>
        )}
      </button>
      <span className="text-[0.62rem] text-brand-ink-soft text-center leading-tight">
        {imageUrl ? 'Change' : 'Add image'}
      </span>
    </div>
  );
}

export function MultiStageVariantManager({ value, onChange }: Props) {
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
          : { label: '', stockQuantity: 0, imageUrl: null, isActive: true };
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
    const stage1 = next[0];
    const maxCount = Math.max(1, ...stage1.options.map((o) => o.selectCount ?? 1));
    next[1] = { ...next[1], maxSelect: maxCount };
    onChange(next);
  }

  const stage1 = stages[0];
  const stage2 = stages[1];

  return (
    <div className="space-y-4">
      {/* Stage 1 — Pack Sizes */}
      <div className="rounded-[12px] border border-brand-indigo/20 bg-brand-indigo/[0.03] p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-[0.72rem] font-bold text-white">1</span>
          <div className="flex-1">
            <p className="mb-1 text-[0.78rem] font-semibold text-brand-ink-soft">Stage 1 label</p>
            <input className={inputClass} value={stage1.label} onChange={(e) => updateStage(0, { label: e.target.value })} placeholder="e.g. Pack Size" />
          </div>
        </div>

        <div className="space-y-2">
          {stage1.options.map((opt, oi) => (
            <div key={oi} className="grid grid-cols-[1fr_110px_120px_32px] items-end gap-2">
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Pack label</p>}
                <input
                  className={inputClass}
                  value={opt.label}
                  onChange={(e) => handleS1OptionChange(oi, { label: e.target.value })}
                  placeholder="e.g. 3 Character Pack"
                />
              </div>
              <div>
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">No. of characters</p>}
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
                  onChange={(e) => handleS1OptionChange(oi, { priceOverride: e.target.value === '' ? null : Number(e.target.value) })}
                  placeholder="Base price"
                />
              </div>
              <button type="button" onClick={() => removeOption(0, oi)} className="flex h-9 w-8 items-center justify-center rounded-[8px] border border-brand-line text-brand-berry hover:bg-brand-cream">×</button>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => addOption(0)} className="mt-3 rounded-full border border-brand-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream">
          + Add pack size
        </button>
      </div>

      {/* Stage 2 — Characters */}
      <div className="rounded-[12px] border border-brand-sky-deep/20 bg-brand-sky-deep/[0.03] p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-sky-deep text-[0.72rem] font-bold text-white">2</span>
          <div className="flex-1">
            <p className="mb-1 text-[0.78rem] font-semibold text-brand-ink-soft">Stage 2 label</p>
            <input className={inputClass} value={stage2.label} onChange={(e) => updateStage(1, { label: e.target.value })} placeholder="e.g. Characters" />
          </div>
        </div>

        <p className="mb-3 text-[0.74rem] text-brand-ink-soft">
          Each character has its own stock and image. Customer picks characters to fill their chosen pack size.
        </p>

        <div className="space-y-2">
          {stage2.options.map((opt, oi) => (
            <div key={oi} className="flex items-end gap-2 rounded-[10px] border border-brand-line bg-white p-2">
              <CharacterImageUpload
                imageUrl={opt.imageUrl}
                onUpload={(url) => updateOption(1, oi, { imageUrl: url })}
              />
              <div className="flex-1 min-w-0">
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Character name</p>}
                <input
                  className={inputClass}
                  value={opt.label}
                  onChange={(e) => updateOption(1, oi, { label: e.target.value })}
                  placeholder="e.g. Spiderman"
                />
              </div>
              <div className="w-24">
                {oi === 0 && <p className="mb-1 text-[0.72rem] text-brand-ink-soft">Stock qty</p>}
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={opt.stockQuantity}
                  onChange={(e) => updateOption(1, oi, { stockQuantity: Number(e.target.value) || 0 })}
                />
              </div>
              <button type="button" onClick={() => removeOption(1, oi)} className="flex h-9 w-8 shrink-0 items-center justify-center rounded-[8px] border border-brand-line text-brand-berry hover:bg-brand-cream">×</button>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => addOption(1)} className="mt-3 rounded-full border border-brand-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream">
          + Add character
        </button>
      </div>
    </div>
  );
}