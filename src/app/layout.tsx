import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { COMPANY } from '@/config/company';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
