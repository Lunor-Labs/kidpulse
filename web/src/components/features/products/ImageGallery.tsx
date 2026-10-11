'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import type { ProductImage } from '@/types/catalog';

const EMOJI_FALLBACK: Record<string, string> = {
  'painting-kits': '🖌️',
  'stem-kits': '🧪',
  'gift-collections': '🎁',
  'learning-toys': '🦁',
};

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
  categorySlug: string;
}

export function ImageGallery({ images, productName, categorySlug }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const hasImages = images.length > 0;
  const activeImage = images[activeIndex];
  const emoji = EMOJI_FALLBACK[categorySlug] ?? '🎨';

  function scrollStrip(dir: -1 | 1) {
    if (stripRef.current) {
      stripRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  }

  function prev() {
    setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }

  function next() {
    setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Main image */}
      <div className="relative overflow-hidden rounded-[20px] border border-brand-line bg-brand-cream aspect-square">
        {hasImages && activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? productName}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-contain p-4 transition-opacity duration-200"
            priority
          />
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center text-[100px]">
            {emoji}
          </div>
        )}
      </div>

      {/* Thumbnail strip with scroll arrows */}
      {hasImages && images.length > 1 && (
        <div className="relative flex items-center gap-2">

          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-line bg-white shadow-sm hover:bg-brand-cream transition-colors text-brand-indigo font-bold"
          >
            ‹
          </button>

          {/* Scrollable thumbnail row */}
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1"
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border-2 transition-colors duration-150 ${i === activeIndex
                    ? 'border-brand-indigo'
                    : 'border-brand-line hover:border-brand-indigo/40'
                  }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${productName} view ${i + 1}`}
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-line bg-white shadow-sm hover:bg-brand-cream transition-colors text-brand-indigo font-bold"
          >
            ›
          </button>

        </div>
      )}
    </div>
  );
}