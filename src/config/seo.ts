import { Metadata } from 'next';
import { COMPANY } from './company';
import { FOUNDER } from './founder';

export const SEO_CONFIG = {
  siteName: COMPANY.displayName,
  siteUrl: COMPANY.websiteUrl,
  defaultTitle: `${COMPANY.displayName} | High-Performance Web & Autonomous AI Engineering`,
  titleTemplate: `%s | ${COMPANY.displayName}`,
  defaultDescription:
    'Coimbatore-based software engineering and AI automation studio. We design high-performance web systems, custom enterprise software, and private AI knowledge platforms. Free demo before payment.',
  keywords: [
    'Logic Intelligence Technologies',
    'Vikash Saravanan',
    'AI automation Coimbatore',
    'Full-stack web development Tamil Nadu',
    'Custom web applications India',
    'Enterprise software systems',
    'Omni-Apply workflow engine',
    'Autonomous publishing systems',
    'Next.js Supabase engineering',
    'FastAPI AI services',
    'Private RAG systems',
    'Business process automation',
  ],
  locale: 'en_IN',
  authors: [
    {
      name: FOUNDER.name,
      url: FOUNDER.portfolioUrl,
    },
  ],
  creator: FOUNDER.name,
  publisher: COMPANY.legalName,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: COMPANY.websiteUrl,
    siteName: COMPANY.displayName,
    title: `${COMPANY.displayName} | Where Logic Meets Innovation`,
    description:
      'Coimbatore-based software engineering and AI automation studio. High-performance web systems, custom enterprise software, and private AI platforms.',
    images: [
      {
        url: `${COMPANY.websiteUrl}${COMPANY.bannerPath}`,
        width: 1200,
        height: 630,
        alt: `${COMPANY.displayName} - Software Engineering & Intelligent Automation`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY.displayName} | Where Logic Meets Innovation`,
    description:
      'Coimbatore-based software engineering and AI automation studio. High-performance web systems, custom enterprise software, and private AI platforms.',
    images: [`${COMPANY.websiteUrl}${COMPANY.bannerPath}`],
    creator: '@vikashsaravanan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
};

/**
 * Helper to generate standardized Next.js Metadata objects for routes
 */
export function constructMetadata({
  title,
  description,
  image,
  canonical,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${COMPANY.displayName}`
    : SEO_CONFIG.defaultTitle;
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageImage = image || `${COMPANY.websiteUrl}${COMPANY.bannerPath}`;
  const pageUrl = canonical
    ? `${COMPANY.websiteUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : COMPANY.websiteUrl;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: SEO_CONFIG.keywords,
    authors: SEO_CONFIG.authors,
    creator: SEO_CONFIG.creator,
    publisher: SEO_CONFIG.publisher,
    metadataBase: new URL(COMPANY.websiteUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: COMPANY.displayName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: SEO_CONFIG.twitter.creator,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : SEO_CONFIG.robots,
  };
}
