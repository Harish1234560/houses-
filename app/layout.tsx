import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://goldenaxisventures.in'),
  title: {
    default: 'Golden Axis Ventures — Real Estate Marketing | Mysuru',
    template: '%s | Golden Axis Ventures',
  },
  description:
    'Golden Axis Ventures is a Mysuru-based real estate marketing and sales organisation, connecting developers, investors and homebuyers through trust, transparency and results — with a growing footprint across South India.',
  keywords: [
    'real estate marketing Mysuru',
    'property sales Karnataka',
    'project marketing',
    'digital marketing real estate',
    'plotted development sales',
    'Golden Axis Ventures',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://goldenaxisventures.in',
    siteName: 'Golden Axis Ventures',
    title: 'Golden Axis Ventures — Your Property. Our Marketing Power.',
    description:
      'A Mysuru-based real estate marketing and sales organisation connecting developers, investors and homebuyers across South India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Golden Axis Ventures — Real Estate Marketing | Mysuru',
    description:
      'A Mysuru-based real estate marketing and sales organisation connecting developers, investors and homebuyers across South India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider>
          <SupabaseProvider>
            <ToastProvider />
            {children}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
