import "@/lib/fix-performance";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/ui/cookie-consent";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Deniko | Profesyonel Özel Ders Yönetimi",
    template: "%s | Deniko",
  },
  description:
    "Deniko ile özel ders süreçlerinizi profesyonelce yönetin. Öğrenci takibi, ders programlama, finansal yönetim ve veli bilgilendirme sistemleriyle eğitimde dijital dönüşümü yakalayın.",
  metadataBase: new URL("https://deniko.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Deniko | Profesyonel Özel Ders Yönetimi",
    description: "Deniko ile özel ders süreçlerinizi profesyonelce yönetin.",
    url: "https://deniko.net",
    siteName: "Deniko",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Deniko",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  appleWebApp: {
    title: "Deniko",
    statusBarStyle: "default",
    capable: true,
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Deniko",
  url: "https://deniko.net",
  logo: "https://deniko.net/web-app-manifest-512x512.png",
  sameAs: [
    "https://github.com/Kinin-Code-Offical",
    "https://www.patreon.com/YamacGursel",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
