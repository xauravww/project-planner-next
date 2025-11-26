import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-real-browser', 'xvfb', 'sleep']
};

export default nextConfig;
