import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  serverExternalPackages: ["pino", "pino-pretty"],

  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" }, // Google Profil Fotoları
      { hostname: "storage.googleapis.com" },    // Google Cloud Storage
    ],
  },

  // Güvenlik Başlıkları (Headers) Ekliyoruz
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