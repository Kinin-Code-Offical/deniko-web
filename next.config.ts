import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // 👇 BU KISIM HAYATİ ÖNEM TAŞIYOR.
  // Bu ayar olmadan bcryptjs ve storage kütüphaneleri derlenirken patlar.
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "bcryptjs",
    "@google-cloud/storage",
    "nodemailer"
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
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https://lh3.googleusercontent.com https://storage.googleapis.com https://api.dicebear.com;",
              "font-src 'self';",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'none';",
              "upgrade-insecure-requests;",
              "connect-src 'self' https://www.google-analytics.com;",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;