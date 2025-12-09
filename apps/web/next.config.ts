import type { NextConfig } from "next";
import { locales, defaultLocale } from "./src/i18n/config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: [...locales],
    defaultLocale,
    localeDetection: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
