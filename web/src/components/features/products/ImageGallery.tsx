'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@/types/catalog';

const EMOJI_FALLBACK: Record<string, string> = {
  'painting-kits':    '🖌️',
  'stem-kits':        '🧪',
  'gift-collections': '🎁',
  'learning-toys':    '🦁',
};

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
  categorySlug: string;
}

export function ImageGallery({ images, productName, categorySlug }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = images[activeIndex];
  const emoji = EMOJI_FALLBACK[categorySlug] ?? '🎨';

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip */}
      {hasImages && images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-[58px] w-[58px] overflow-hidden rounded-[10px] border-2 transition-colors duration-150 ${
                i === activeIndex
                  ? 'border-brand-indigo'
                  : 'border-brand-line hover:border-brand-indigo/40'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} view ${i + 1}`}
                fill
                sizes="58px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-[20px] border border-brand-line bg-brand-cream">
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
          <div className="flex h-full min-h-[380px] items-center justify-center text-[100px]">
            {emoji}
          </div>
        )}
      </div>
    </div>
  );
}