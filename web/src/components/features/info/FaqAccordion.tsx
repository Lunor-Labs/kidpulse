'use client';

import { useState } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="rounded-[14px] border border-brand-line bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-[0.95rem] text-brand-ink">{item.question}</span>
              <span
                className={`shrink-0 text-[1.1rem] text-brand-indigo transition-transform ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-[0.88rem] leading-relaxed text-brand-ink-soft">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
