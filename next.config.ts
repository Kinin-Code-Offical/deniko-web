import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // <-- BU SATIR ÇOK ÖNEMLİ

  serverExternalPackages: ["pino", "pino-pretty"],

  // Resim optimizasyonu için domainlere izin ver (Google User Content vb.)
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" }, // Google Login fotoları
      { hostname: "storage.googleapis.com" },    // Senin Cloud Storage bucket'ın
    ],
  },
};

export default nextConfig;