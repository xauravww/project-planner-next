import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-real-browser', 'xvfb', 'sleep'],
  experimental: {
    cpus: 1
  },
  allowedDevOrigins: [
    "http://localhost:3002",
    "http://localhost:3012",
    "http://100.81.27.4",
    "http://100.81.27.4:3012",
    "http://100.81.27.4:3002",
  ],
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
