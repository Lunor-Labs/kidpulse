import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { AnnouncementBar } from '@/components/features/layout/AnnouncementBar';
import { SiteHeader } from '@/components/features/layout/SiteHeader';
import { SiteFooter } from '@/components/features/layout/SiteFooter';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

// Fonts are self-hosted (latin subset, from Fontsource) instead of next/font/google
// so the build never depends on reaching Google Fonts — a failed download there
// breaks the Turbopack build in CI.
const baloo = localFont({
  src: './fonts/baloo-2-latin-wght-normal.woff2',
  weight: '400 800',
  variable: '--font-baloo',
  display: 'swap',
});
const fredoka = localFont({
  src: './fonts/fredoka-latin-wght-normal.woff2',
  weight: '300 700',
  variable: '--font-fredoka',
  display: 'swap',
});
const chewy = localFont({
  src: './fonts/chewy-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-chewy',
  display: 'swap',
});
const roboto = localFont({
  src: './fonts/roboto-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-roboto',
  display: 'swap',
});

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
    <html lang="en" className={`${baloo.variable} ${fredoka.variable} ${chewy.variable} ${roboto.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AuthProvider>
          <AnnouncementBar />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster position="bottom-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}