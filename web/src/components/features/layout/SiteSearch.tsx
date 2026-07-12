'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/lib/api';
import type { ProductSuggestion } from '@/types/catalog';

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink-soft"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function formatPrice(p: number) {
  return `Rs. ${p.toLocaleString('en-LK')}`;
}

export function SiteSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      try {
        const results = await searchProducts(q, 6);
        if (!controller.signal.aborted) {
          setSuggestions(results);
        }
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 220);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (target?: string) => {
    const q = (target ?? query).trim();
    if (!q) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const showDropdown = isOpen && query.trim().length >= 3;

  return (
    <div
      ref={containerRef}
      className="relative max-w-[480px] flex-1 max-[980px]:order-3 max-[980px]:basis-full max-[980px]:max-w-full"
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search painting kits, STEM toys, gifts..."
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="site-search-suggestions"
          aria-expanded={showDropdown}
          className="w-full rounded-full border-none bg-white py-[11px] pl-[42px] pr-[18px] font-sans text-[0.92rem] text-brand-ink placeholder:text-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
        />
      </form>

      {showDropdown && (
        <div id="site-search-suggestions" className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[14px] border border-brand-line bg-white shadow-[0_18px_36px_rgba(27,11,128,0.14)]">
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-[0.88rem] text-brand-ink-soft">Searching…</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-[0.88rem] text-brand-ink-soft">
              No matches. Press Enter to search anyway.
            </div>
          ) : (
            <ul>
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/products/${s.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-brand-cream/60"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-brand-cream">
                      {s.imageUrl && (
                        <Image
                          src={s.imageUrl}
                          alt={s.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.9rem] font-semibold text-brand-ink">
                        {s.name}
                      </div>
                      <div className="text-[0.72rem] text-brand-ink-soft">
                        {s.categoryName}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-[0.86rem] font-bold text-brand-indigo">
                      {formatPrice(s.price)}
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-brand-line">
                <button
                  type="button"
                  onClick={() => submit()}
                  className="w-full px-4 py-3 text-left text-[0.86rem] font-semibold text-brand-indigo hover:bg-brand-cream/60"
                >
                  See all results for “{query.trim()}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
