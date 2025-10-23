import type { NextConfig } from "next";

const nextConfig: any = {
  experimental: {
    appDir: true,
    turbo: false, // Turbopack を無効化して Webpack に戻す
  },
};

export default nextConfig;
