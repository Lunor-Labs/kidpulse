import { Suspense } from 'react';
import { BestSellers } from '@/components/features/home/BestSellers';
import { CategoryCards } from '@/components/features/home/CategoryCards';
import { DeliveryStrip } from '@/components/features/home/DeliveryStrip';
import { HeroSlider } from '@/components/features/home/HeroSlider';
import { MomentsGallery } from '@/components/features/home/MomentsGallery';
import { NewsletterSignup } from '@/components/features/home/NewsletterSignup';
import { SaleBanner } from '@/components/features/home/SaleBanner';
import { Testimonials } from '@/components/features/home/Testimonials';
import { TrustRow } from '@/components/features/home/TrustRow';
import { Skeleton } from '@/components/ui/Skeleton';

function HeroSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
      <Skeleton className="h-[340px] w-full sm:h-[440px]" />
    </div>
  );
}

function CategoryCardsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[210px]" />
        ))}
      </div>
    </div>
  );
}

function BestSellersSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-[60px] sm:px-8">
      <div className="grid grid-cols-2 gap-[18px] md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSlider />
      </Suspense>
      <TrustRow />
      <DeliveryStrip />
      <Suspense fallback={<CategoryCardsSkeleton />}>
        <CategoryCards />
      </Suspense>
      <SaleBanner />
      <Suspense fallback={<BestSellersSkeleton />}>
        <BestSellers />
      </Suspense>
      <MomentsGallery />
      <Testimonials />
      <NewsletterSignup />
    </>
  );
}