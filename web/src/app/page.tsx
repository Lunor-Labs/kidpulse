import { BestSellers } from '@/components/features/home/BestSellers';
import { CategoryCards } from '@/components/features/home/CategoryCards';
import { DeliveryStrip } from '@/components/features/home/DeliveryStrip';
import { HeroSlider } from '@/components/features/home/HeroSlider';
import { MomentsGallery } from '@/components/features/home/MomentsGallery';
import { NewsletterSignup } from '@/components/features/home/NewsletterSignup';
import { SaleBanner } from '@/components/features/home/SaleBanner';
import { Testimonials } from '@/components/features/home/Testimonials';
import { TrustRow } from '@/components/features/home/TrustRow';

export default async function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustRow />
      <DeliveryStrip />
      <CategoryCards />
      <SaleBanner />
      <BestSellers />
      <MomentsGallery />
      <Testimonials />
      <NewsletterSignup />
    </>
  );
}