import { MetadataRoute } from 'next';
import { COMPANY } from '@/config/company';
import { packagesData } from '@/data/packagesData';
import { portfolioProjects } from '@/data/portfolioData';
import { blogPosts } from '@/data/blogData';
import { servicesData } from '@/data/servicesData';
import { industriesData } from '@/data/industriesData';
import { productsData } from '@/data/productsData';
import { PDF_RESOURCES } from '@/config/pdfs';

export const dynamic = 'force-static';

// Verifiable content release baseline timestamp to avoid artificial lastmod spoofing
const LAST_RELEASE_DATE = new Date('2026-10-14T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = COMPANY.websiteUrl.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about/founder`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/company/facts`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/industries`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/products/ai-website-agents`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/products/ai-voice-agents`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/products/facts`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/healthcare`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/healthcare/plans`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.90 },
    { url: `${baseUrl}/products/logic-voice`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/voice-shield`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/pricing`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/packages`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/work`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/jobs`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/press`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/book-consultation`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/support`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/checklist`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/discovery`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/free-demo`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/ai`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/investors`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/architecture`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/roi-calculator`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/docs/api`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/security`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/accessibility`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/sales`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/help-center`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/status`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'daily', priority: 0.5 },
    { url: `${baseUrl}/knowledge-base`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/ai-ethics`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/ai-assistant`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/certifications`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/community`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/investor-brief`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/ai-discovery`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/expertise`, lastModified: LAST_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((svc) => ({
    url: `${baseUrl}/services/${svc.slug}`,
    lastModified: LAST_RELEASE_DATE,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const industryRoutes: MetadataRoute.Sitemap = industriesData.map((ind) => ({
    url: `${baseUrl}/industries/${ind.slug}`,
    lastModified: LAST_RELEASE_DATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = productsData.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: LAST_RELEASE_DATE,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = PDF_RESOURCES.map((res) => ({
    url: `${baseUrl}/resources/${res.slug}`,
    lastModified: new Date(res.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const packageRoutes: MetadataRoute.Sitemap = packagesData.map((pkg) => ({
    url: `${baseUrl}/packages/${pkg.slug}`,
    lastModified: LAST_RELEASE_DATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = portfolioProjects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: LAST_RELEASE_DATE,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const allRoutes = [
    ...staticRoutes,
    ...serviceRoutes,
    ...industryRoutes,
    ...productRoutes,
    ...resourceRoutes,
    ...packageRoutes,
    ...workRoutes,
    ...blogRoutes,
  ];

  const seen = new Set<string>();
  return allRoutes.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
