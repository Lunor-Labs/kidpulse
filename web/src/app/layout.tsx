import type { Metadata } from 'next';
import { Baloo_2, Fredoka, Chewy } from 'next/font/google';
import { Toaster } from 'sonner';
import { AnnouncementBar } from '@/components/features/layout/AnnouncementBar';
import { SiteHeader } from '@/components/features/layout/SiteHeader';
import { SiteFooter } from '@/components/features/layout/SiteFooter';
import './globals.css';

const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', display: 'swap' });
const chewy = Chewy({ subsets: ['latin'], variable: '--font-chewy', weight: '400', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'KidPulse — Craft Kits for Kids', template: '%s | KidPulse' },
  description:
    'DIY character painting kits and STEM kits that turn screen time into hands-on play. Island-wide delivery in Sri Lanka.',
  openGraph: {
    title: 'KidPulse — Craft Kits for Kids',
    description: 'Craft kits that turn screen time into hands-on play.',
    images: ['/images/hero-graphic.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${fredoka.variable} ${chewy.variable}`}>
      <body className="font-sans antialiased">
        <AnnouncementBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}