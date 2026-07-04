import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-full border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-ink-soft focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/30',
        className
      )}
      {...props}
    />
  );
}
