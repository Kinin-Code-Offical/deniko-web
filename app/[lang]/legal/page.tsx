import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import Link from "next/link";
import { ArrowRight, Shield, FileText, Cookie, Scale } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  const { title, description } = dictionary.legal;

  const baseUrl = "https://deniko.net";
  const pathname = "/legal";

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}${pathname}`,
      languages: {
        "tr-TR": `/tr${pathname}`,
        "en-US": `/en${pathname}`,
      },
    },
    openGraph: {
      title: `${title} | Deniko`,
      description,
      url: `${baseUrl}/${lang}${pathname}`,
      siteName: "Deniko",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Deniko`,
      description,
    },
    robots: {
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  const dictionary = await getDictionary(lang);

  const legalDocs = [
    {
      href: `/${lang}/legal/terms`,
      title: dictionary.legal.docs.terms.title,
      description: dictionary.legal.docs.terms.description,
      icon: FileText,
    },
    {
      href: `/${lang}/legal/privacy`,
      title: dictionary.legal.docs.privacy.title,
      description: dictionary.legal.docs.privacy.description,
      icon: Shield,
    },
    {
      href: `/${lang}/legal/cookies`,
      title: dictionary.legal.docs.cookies.title,
      description: dictionary.legal.docs.cookies.description,
      icon: Cookie,
    },
    {
      href: `/${lang}/legal/kvkk`,
      title: dictionary.legal.docs.kvkk.title,
      description: dictionary.legal.docs.kvkk.description,
      icon: Scale,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: dictionary.legal.title,
    description: dictionary.legal.description,
    url: `https://deniko.net/${lang}/legal`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `https://deniko.net/${lang}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: dictionary.legal.title,
          item: `https://deniko.net/${lang}/legal`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: legalDocs.map((doc, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://deniko.net${doc.href}`,
        name: doc.title,
        description: doc.description,
      })),
    },
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-16 py-8 duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-50 via-white to-blue-50 px-6 py-16 text-center sm:px-12 sm:py-24 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-blue-100/50 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:bg-blue-900/30 dark:text-blue-300">
            <Scale className="mr-2 h-4 w-4" />
            {dictionary.legal.center}
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            {dictionary.legal.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {dictionary.legal.description}
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {legalDocs.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:shadow-blue-900/20"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-900/20"></div>

            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                <doc.icon className="h-7 w-7" />
              </div>

              <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                {doc.title}
              </h2>
              <p className="mb-8 flex-1 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {doc.description}
              </p>

              <div className="flex items-center text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                {dictionary.legal.read_more}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
