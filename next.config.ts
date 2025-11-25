import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    externals: ['puppeteer-real-browser', 'xvfb', 'sleep']
  }
};

export default nextConfig;
