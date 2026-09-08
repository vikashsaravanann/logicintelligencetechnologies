import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { COMPANY } from '@/config/company';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

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
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-48.png',
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
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: COMPANY.legalName,
              url: COMPANY.websiteUrl,
              logo: "https://www.logicintelligencetechnologies.in/icon-192.png",
              image: "https://www.logicintelligencetechnologies.in/icon.png",
              sameAs: [
                COMPANY.linkedinUrl,
                COMPANY.instagramUrl,
                COMPANY.facebookUrl,
              ],
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
