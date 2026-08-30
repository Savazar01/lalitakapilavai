import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "./"),
  images: {
    remotePatterns: [
      // Cloudflare R2 storage & custom domain distribution
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      // AWS S3 standard & regional domains
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      // Deployment domain distributions
      {
        protocol: "https",
        hostname: "**.savazar.com",
      },
      {
        protocol: "https",
        hostname: "**.lalitakapilavai.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "/api/media/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/posts",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/posts/:slug*",
        destination: "/blogs/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
