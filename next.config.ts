import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/vikash-portfolio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
  serverExternalPackages: ['pdf-parse', '@xenova/transformers'],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
    ],
  },
};

export default nextConfig;
