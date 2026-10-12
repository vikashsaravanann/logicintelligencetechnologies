import { MetadataRoute } from 'next';
import { COMPANY } from '@/config/company';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = COMPANY.websiteUrl.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/client',
        '/client/',
        '/api',
        '/api/',
        '/proposal',
        '/proposal/',
        '/dashboard',
        '/dashboard/',
        '/profile',
        '/profile/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
