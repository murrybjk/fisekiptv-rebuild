import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Disable static optimization for pages using video player
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Turbopack configuration
  turbopack: {},

  // Webpack configuration to handle video.js SSR issues (fallback for --webpack mode)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'video.js', 'mpegts.js']
    }
    return config
  },

  // Experimental features
  experimental: {
    // Disable server actions if causing issues
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
