import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack has built-in support for:
  // - CSS and PostCSS (including Tailwind CSS)
  // - Modern JavaScript and TypeScript
  // - Module resolution and bundling
  // - No additional configuration needed for standard use cases
  turbopack: {},
};

export default nextConfig;
