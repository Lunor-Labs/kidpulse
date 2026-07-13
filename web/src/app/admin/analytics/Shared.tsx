'use client';

import { useMemo, useState } from 'react';

export function money(v: number, currency = 'LKR') {
  return `${currency} ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  onExport?: () => void;
  exportLabel?: string;
  exporting?: boolean;
  extra?: React.ReactNode;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  onExport,
  exportLabel = 'Download CSV',
  exporting,
  extra,
}: DateRangePickerProps) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
        From
        <input
          type="date"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
        />
      </label>
      <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
        To
        <input
          type="date"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
          className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(localFrom, localTo)}
        className="rounded-full bg-brand-indigo px-4 py-2 text-[0.82rem] font-semibold text-white hover:bg-brand-indigo/90"
      >
        Apply
      </button>
      {extra}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="ml-auto rounded-full border border-brand-line px-4 py-2 text-[0.82rem] font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-60"
        >
          {exporting ? 'Preparing…' : exportLabel}
        </button>
      )}
    </div>
  );
}

interface SparkBarProps {
  points: { label: string; value: number }[];
  format?: (v: number) => string;
  height?: number;
}

export function SparkBar({ points, format = String, height = 140 }: SparkBarProps) {
  const max = useMemo(() => Math.max(1, ...points.map((p) => p.value)), [points]);
  return (
    <div className="flex items-end gap-[2px] overflow-x-auto" style={{ height }}>
      {points.map((p, i) => {
        const h = Math.round((p.value / max) * (height - 24));
        return (
          <div key={i} className="flex flex-col items-center" title={`${p.label}: ${format(p.value)}`}>
            <div
              className="w-[10px] rounded-t bg-brand-indigo/80"
              style={{ height: Math.max(2, h) }}
            />
            <div className="mt-1 h-[12px] w-[10px] text-[0.6rem] text-brand-ink-soft" />
          </div>
        );
      })}
    </div>
  );
}
