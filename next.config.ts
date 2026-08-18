import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-real-browser', 'xvfb', 'sleep'],
  experimental: {
    cpus: 1
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
