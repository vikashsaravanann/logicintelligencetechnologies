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
      { source: '/client', destination: '/client/dashboard', permanent: false },
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
    // Security headers applied to every route (OPS02).
    // Content-Security-Policy is enforced via Content-Security-Policy-Report-Only
    // until rollout verification is complete; tighten to enforced CSP in a
    // follow-up migration once all frame/script sources are confirmed.
    const securityHeaders = [
      // Prevent MIME-type sniffing attacks.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Block clickjacking - SAMEORIGIN allows our own portal iframes.
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Limit referrer to origin for cross-origin requests.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Restrict browser feature APIs not required by this application.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
      },
      // HSTS: 1 year for production; includeSubDomains guards sub-portals.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
      // Report-Only CSP: covers Next.js, Supabase, Vercel Analytics,
      // Google Fonts, company CDN, and PDF/iframe preview.
      {
        key: 'Content-Security-Policy-Report-Only',
        value: [
          "default-src 'self'",
          // Next.js requires 'unsafe-inline' for style injection; nonce-based
          // hardening is the next step after CSP report analysis.
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          // Supabase storage for document previews and avatars.
          "frame-src 'self' blob:",
          // Supabase + Vercel API calls.
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ];

    return [
      // Apply security headers to all routes.
      {
        source: '/:path*',
        headers: securityHeaders,
      },
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
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/fonts/**/*', './src/lib/pdf/fonts/**/*'],
  },
};

export default nextConfig;
