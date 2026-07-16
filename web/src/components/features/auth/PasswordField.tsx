'use client';

import { useState } from 'react';

function scorePassword(pw: string): { score: number; label: string; hint: string | null } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const label = labels[Math.min(score, 5)];
  const hint =
    pw.length === 0
      ? null
      : pw.length < 8
      ? 'Use at least 8 characters.'
      : score < 3
      ? 'Mix upper/lower case, numbers, and symbols.'
      : null;
  return { score, label, hint };
}

interface PasswordFieldProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  showStrength?: boolean;
  placeholder?: string;
  autoComplete?: string;
  label?: string;
  minLength?: number;
  disabled?: boolean;
}

export function PasswordField({
  id = 'password',
  name = 'password',
  value,
  onChange,
  showStrength = false,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  label = 'Password',
  minLength = 8,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { score, label: strengthLabel, hint } = scorePassword(value);
  const barWidth = value.length === 0 ? 0 : Math.max(10, (score / 5) * 100);
  const barColor =
    score <= 1 ? 'bg-brand-berry' : score <= 3 ? 'bg-brand-gold' : 'bg-brand-olive';

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          disabled={disabled}
          className="w-full rounded-[12px] border border-brand-line bg-white px-4 py-3 pr-16 text-[0.95rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[0.72rem] font-semibold text-brand-ink-soft hover:text-brand-indigo"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {showStrength && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-line">
            <div
              className={`h-full transition-all ${barColor}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[0.72rem] text-brand-ink-soft">
            <span>{value.length > 0 ? strengthLabel : 'Enter a password'}</span>
            {hint && <span className="text-brand-berry">{hint}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
