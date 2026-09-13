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
  serverExternalPackages: ['pdf-parse'],

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
