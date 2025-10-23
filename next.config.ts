import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Optimize webpack for better hot reload
  webpack: (config, { dev, isServer }) => {
    // Handle reflect-metadata for inversify properly
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "reflect-metadata": "reflect-metadata",
      });
    }

    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

