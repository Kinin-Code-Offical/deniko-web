import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // 👇 BU SATIRI GÜNCELLEYİN
  // bcryptjs ve @google-cloud/storage kütüphanelerini buraya ekliyoruz.
  serverExternalPackages: ["pino", "pino-pretty", "bcryptjs", "@google-cloud/storage"],

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
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https://lh3.googleusercontent.com https://storage.googleapis.com https://api.dicebear.com;",
              "font-src 'self';",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'none';",
              "upgrade-insecure-requests;",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;