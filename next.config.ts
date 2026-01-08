import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: false,
  },
};

const withPWAConfig = withPWA(pwaConfig)(nextConfig);

export default {
  ...withPWAConfig,
  turbopack: {},
};
