import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/fixtures/**" },
      { pathname: "/api/media/**" },
    ],
  },
};

export default nextConfig;
