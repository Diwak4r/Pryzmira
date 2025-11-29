import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'fullstackopen.com',
      },
      {
        protocol: 'https',
        hostname: 'roadmap.sh',
      },
      {
        protocol: 'https',
        hostname: 'design-style-guide.freecodecamp.org',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'refactoring.guru',
      },
      {
        protocol: 'https',
        hostname: 'developer.mozilla.org',
      },
      {
        protocol: 'https',
        hostname: 'react.dev',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
    ],
  },
};

export default nextConfig;
