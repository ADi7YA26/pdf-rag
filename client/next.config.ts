import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In development, proxy /api/* → backend so the browser never hits
    // a different origin (avoids CORS issues when NEXT_PUBLIC_BACKEND_URL
    // is not set). In production, set NEXT_PUBLIC_BACKEND_URL instead.
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
