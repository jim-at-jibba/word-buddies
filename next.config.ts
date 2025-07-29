import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        buffer: false,
        querystring: false,
      };
    }
    
    // Exclude better-sqlite3 from client bundle
    config.externals = config.externals || [];
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3',
    });

    return config;
  },
};

export default nextConfig;
