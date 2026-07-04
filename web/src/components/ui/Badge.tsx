import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  tone?: 'berry' | 'gold' | 'sky' | 'neutral';
  className?: string;
  children: ReactNode;
}

const tones = {
  berry: 'bg-brand-berry text-white',
  gold: 'bg-brand-gold text-brand-ink',
  sky: 'bg-brand-sky text-white',
  neutral: 'bg-brand-cream text-brand-ink-soft',
};

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
