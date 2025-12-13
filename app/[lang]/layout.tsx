import { i18n } from "@/i18n-config";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const isNoIndex = env.NEXT_PUBLIC_NOINDEX;

  return {
    title: {
      default: dictionary.metadata.home.title,
      template: `%s | ${dictionary.common.brand_name}`,
    },
    description: dictionary.metadata.home.description,
    openGraph: {
      title: dictionary.metadata.home.title,
      description: dictionary.metadata.home.description,
      siteName: dictionary.common.brand_name,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    robots: isNoIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        tr: "/tr",
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  // Validate that the incoming `lang` parameter is a valid locale
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }
  return <main id="main-content">{children}</main>;
}
