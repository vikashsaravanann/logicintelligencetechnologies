import type { Metadata, Viewport } from 'next';
import { Poppins, Lora, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { COMPANY } from '@/config/company';
import { organizationNode, websiteNode } from '@/lib/seo/schema';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
import GlobalBackground from '@/components/ui/global-background';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LitAnalytics } from '@/components/analytics/lit-analytics';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-poppins-var',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--font-lora-var',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-var',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B1628' },
    { media: '(prefers-color-scheme: light)', color: '#F7F9FC' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Logic Intelligence Technologies | AI Products & Healthcare Technology',
    template: '%s | Logic Intelligence Technologies',
  },
  description:
    'Logic Intelligence Technologies builds AI-driven products, intelligent automation, and connected digital platforms for modern organizations. Creators of LIT Healthcare and Logic Voice — based in Coimbatore, Tamil Nadu, India.',
  keywords: [
    'Logic Intelligence Technologies',
    'AI technology company',
    'AI products',
    'AI automation',
    'AI agents',
    'LIT Healthcare',
    'healthcare platform',
    'hospital management system',
    'clinic management',
    'smart hospital',
    'Logic Voice',
    'AI voice assistant',
    'personal AI assistant',
    'voice-first AI',
    'AI-powered automation',
    'Vikash Saravanan',
    'Coimbatore',
    'India',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.logicintelligencetechnologies.in'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: COMPANY.legalName,
    title: 'Logic Intelligence Technologies | Intelligent Technology. Connected Possibilities.',
    description:
      'Logic Intelligence Technologies builds AI-driven products, intelligent automation and connected digital platforms — including LIT Healthcare and Logic Voice.',
    images: [
      {
        url: COMPANY.bannerPath,
        width: 1200,
        height: 630,
        alt: 'Logic Intelligence Technologies — Intelligent Technology. Connected Possibilities.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logic Intelligence Technologies | Intelligent Technology. Connected Possibilities.',
    description:
      'AI technology company building intelligent products and connected platforms. LIT Healthcare · Logic Voice · AI Agents.',
    images: [COMPANY.bannerPath],
  },
  icons: {
    icon: [
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/logo-icon.jpg', type: 'image/jpeg' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: '37m02DgA2U-ZJ40jbzGhSw3l4UluW2B-Y_0g5b069K8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${lora.variable} ${jetbrainsMono.variable} overflow-x-hidden w-full max-w-[100vw]`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/assets/logo-icon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [organizationNode(), websiteNode()],
            }),
          }}
        />
      </head>
      <body className={`${poppins.className} m-0 p-0 w-full max-w-[100vw] overflow-x-hidden`}>
        <a href="#main-content" className="lit-skip">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <GlobalBackground />
          <Toaster position="top-right" toastOptions={{ style: { background: '#0D1B3E', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.12)' } }} />
          {children}
          <SpeedInsights />
          <LitAnalytics />
          {process.env.NODE_ENV === 'development' && (
            <Script type="module" src="http://localhost:7331/inject.js" strategy="afterInteractive" />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
