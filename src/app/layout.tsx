import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { COMPANY } from '@/config/company';
import { organizationNode, websiteNode } from '@/lib/seo/schema';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
import GlobalVideoBackground from '@/components/ui/global-video-background';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1E' },
    { media: '(prefers-color-scheme: light)', color: '#F7F4EE' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Logic Intelligence Technologies | Premium Web & Software Development',
    template: '%s | Logic Intelligence Technologies',
  },
  description:
    'Full-stack web development, mobile apps, and enterprise software for businesses. Based in Coimbatore, India. Free demo available.',
  keywords: [
    'web development',
    'mobile app development',
    'custom software',
    'Coimbatore',
    'India',
    'React',
    'Next.js',
    'full stack',
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
    images: [
      {
        url: COMPANY.bannerPath,
        width: 1200,
        height: 630,
        alt: 'Logic Intelligence Technologies — Where Logic Meets Innovation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden w-full max-w-[100vw]">
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
      <body className={`${inter.className} m-0 p-0 w-full max-w-[100vw] overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <GlobalVideoBackground />
          <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          {children}
          <SpeedInsights />
          <Analytics />
          {process.env.NODE_ENV === 'development' && (
            <script type="module" src="http://localhost:7331/inject.js" suppressHydrationWarning />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
