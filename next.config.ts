import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      { protocol: "https", hostname: "**.mercadolibre.com" },
      { protocol: "https", hostname: "**.mlstatic.com" },
      { protocol: "http", hostname: "**.mlstatic.com" },
    ],
  },
};

export default nextConfig;
