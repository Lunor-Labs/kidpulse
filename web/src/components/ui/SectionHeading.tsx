import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold text-brand-indigo md:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
