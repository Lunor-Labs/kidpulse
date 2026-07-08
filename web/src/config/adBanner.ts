export interface AdBannerConfig {
    enabled: boolean;
    tag: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    gradient: string;
  }
  
  const adBanner: AdBannerConfig = {
    enabled: true,
    tag: '🔥 Limited offer',
    title: 'Buy 2 kits, get 1 FREE',
    subtitle: 'Mix and match any painting kits. This weekend only.',
    ctaLabel: 'Shop the bundle →',
    ctaHref: '/products?category=painting-kits',
    gradient: 'linear-gradient(135deg, #1b0b80, #2c1aa0)',
  };
  
  export default adBanner;