import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/vikashs-portfolio', destination: '/about', permanent: true },
      { source: '/vikashs-portfolio/:path*', destination: '/about', permanent: true },
      { source: '/vikash-portfolio', destination: '/about', permanent: true },
      { source: '/vikash-portfolio/:path*', destination: '/about', permanent: true },
      { source: '/client/profile', destination: '/profile', permanent: true },
      { source: '/omni', destination: '/voice-shield', permanent: true },
      { source: '/omni/:path*', destination: '/voice-shield', permanent: true },
      { source: '/products/omni-publisher', destination: '/voice-shield', permanent: true },
      // The old /dashboard portal was a non-functional mock; the real admin
      // tools live under /admin. Route the closest equivalents, then catch-all.
      { source: '/dashboard/leads', destination: '/admin/leads', permanent: false },
      { source: '/dashboard/analytics', destination: '/admin/analytics', permanent: false },
      { source: '/dashboard/finances', destination: '/admin/invoices', permanent: false },
      { source: '/dashboard', destination: '/admin/command-center', permanent: false },
      { source: '/dashboard/:path*', destination: '/admin/command-center', permanent: false },
      // Engagement lifecycle stage route aliases
      { source: '/engagement/:ref/initial-payment', destination: '/engagement/:ref/initial-invoice', permanent: false },
      { source: '/engagement/:ref/technical-discovery', destination: '/engagement/:ref/discovery', permanent: false },
      { source: '/engagement/:ref/architecture', destination: '/engagement/:ref/technical-spec', permanent: false },
      { source: '/engagement/:ref/uat', destination: '/engagement/:ref/delivery-acceptance', permanent: false },
      { source: '/engagement/:ref/sla-support', destination: '/engagement/:ref/support', permanent: false },
      // Direct shortlink & gateway aliases
      { source: '/booking', destination: '/book-consultation', permanent: true },
      { source: '/company', destination: '/company/facts', permanent: true },
      { source: '/docs', destination: '/docs/api', permanent: true },
      { source: '/client', destination: '/client/workspace', permanent: false },
      { source: '/auth', destination: '/login', permanent: false },
      { source: '/enterprise-checklist', destination: '/engagement', permanent: false },
      { source: '/proposal', destination: '/engagement', permanent: false },
      { source: '/quotation', destination: '/admin/quotations', permanent: false },
      { source: '/payment', destination: '/engagement', permanent: false },
      { source: '/handover', destination: '/engagement', permanent: false },
      { source: '/onboarding', destination: '/engagement', permanent: false },
      { source: '/admin/contracts', destination: '/admin/proposals', permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.webp',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  serverExternalPackages: ['pdf-parse'],

  // Enable the Next.js Image Optimization API (was fully disabled).
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Prefer modern JS output for smaller client bundles where supported.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/fonts/**/*', './src/lib/pdf/fonts/**/*'],
  },
};

export default nextConfig;
