import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { COMPANY } from '@/config/company';
import { organizationNode, websiteNode } from '@/lib/seo/schema';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
    { media: "(prefers-color-scheme: light)", color: "#F7F4EE" },
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
  // App Router icon.tsx / apple-icon.tsx generate circular brand marks.
  // Keep explicit links as progressive enhancement for older clients.
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
    shortcut: '/icon',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <link rel="icon" href="/icon" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon" />
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
