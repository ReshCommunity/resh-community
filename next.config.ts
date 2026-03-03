import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  // Ensure trailing slash handling is consistent
  trailingSlash: false,
};

export default nextConfig;
