import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  // OPSIONAL: Tambahan optimization
  webpack: (config, { isServer }) => {
    // Reduce Mongoose bundle size
    if (isServer) {
      config.externals.push({
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'aws4': 'commonjs aws4',
        'snappy': 'commonjs snappy',
      });
    }
    return config;
  },
  // Compress output
  compress: true,
  // Power mode untuk production
  poweredByHeader: false,
};

export default nextConfig;