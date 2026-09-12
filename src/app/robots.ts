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
        '/admin/',
        '/client/',
        '/api/',
        '/proposal/',
        '/dashboard/',
        '/omni/',
        '/profile/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
