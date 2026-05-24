import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/lead/WhatsAppFloat';
import { SITE } from '@/lib/seo';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description: 'A boutique advisory for buying, selling and renting premium homes in Gurgaon.',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#F6F3EC',
  icons: {
    icon: [
      { url: '/brand/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/favicon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/brand/favicon.png',
  },
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
    images: [{ url: '/brand/logo-header.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />

        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-41QGKL66RD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-41QGKL66RD');
          `}
        </Script>
      </body>
    </html>
  );
}
