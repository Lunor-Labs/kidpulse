import { Hero } from './Hero';
import { HeroCarousel } from './HeroCarousel';
import { ApiUnavailableError, getHomeBanners } from '@/lib/api';
import type { HomeBanner } from '@/types/catalog';

export async function HeroSlider() {
  let banners: HomeBanner[] = [];
  try {
    banners = await getHomeBanners();
  } catch (error) {
    if (error instanceof ApiUnavailableError) return <Hero />;
    throw error;
  }
  if (banners.length === 0) return <Hero />;
  return <HeroCarousel banners={banners} />;
}
