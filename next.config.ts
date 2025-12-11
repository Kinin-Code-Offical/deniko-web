import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
    ],
  },
  // 👇 BU KISIM HAYATİ ÖNEM TAŞIYOR.
  // Bu ayar olmadan bcryptjs ve storage kütüphaneleri derlenirken patlar.
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "bcryptjs",
    "@google-cloud/storage",
    "nodemailer",
  ],

  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "storage.googleapis.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Only add HSTS in non-CI environments to prevent Lighthouse CI issues
          ...(process.env.CI
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // Disable Content-Security-Policy in CI to prevent Lighthouse issues
          ...(process.env.CI
            ? []
            : [
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: *.google-analytics.com *.googletagmanager.com lh3.googleusercontent.com storage.googleapis.com; font-src 'self' data:; connect-src 'self' *.google-analytics.com *.googletagmanager.com;",
                },
              ]),
        ],
      },
      {
        source: "/:all*(svg|jpg|png)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
