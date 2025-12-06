import "@/lib/fix-performance";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/ui/cookie-consent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { headers } from "next/headers";

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
    canonical: "./",
  },
  openGraph: {
    title: "Deniko | Profesyonel Özel Ders Yönetimi",
    description: "Deniko ile özel ders süreçlerinizi profesyonelce yönetin.",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-icon.png",
    },
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Deniko",
      url: "https://deniko.net",
      logo: "https://deniko.net/logo.png",
      sameAs: [
        "https://github.com/Kinin-Code-Offical",
        "https://www.patreon.com/YamacGursel",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "Deniko Education Platform",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "100",
      },
    },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = (await params) || {};
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang={lang || "tr"} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
        >
          Ana içeriğe atla
        </a>
        <GoogleAnalytics nonce={nonce} />
        <script
          id="json-ld-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          nonce={nonce}
        />
        <Providers nonce={nonce}>{children}</Providers>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
