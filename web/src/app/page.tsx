import { AnnouncementBar } from '@/components/features/layout/AnnouncementBar';
import { SiteFooter } from '@/components/features/layout/SiteFooter';
import { SiteHeader } from '@/components/features/layout/SiteHeader';
import { BestSellers } from '@/components/features/home/BestSellers';
import { CategoryCards } from '@/components/features/home/CategoryCards';
import { Hero } from '@/components/features/home/Hero';
import { MomentsGallery } from '@/components/features/home/MomentsGallery';
import { NewsletterSignup } from '@/components/features/home/NewsletterSignup';
import { SaleBanner } from '@/components/features/home/SaleBanner';
import { Testimonials } from '@/components/features/home/Testimonials';

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <CategoryCards />
        <SaleBanner />
        <BestSellers />
        <MomentsGallery />
        <Testimonials />
        <NewsletterSignup />
      </main>
      <SiteFooter />
    </>
  );
}
