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
      { source: '/client/login', destination: '/login', permanent: true },
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
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Enable the Next.js Image Optimization API (was fully disabled).
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
};

export default nextConfig;
