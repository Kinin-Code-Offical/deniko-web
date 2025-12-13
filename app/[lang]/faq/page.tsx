import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { FAQSection } from "@/components/support/faq-section";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { auth } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const isTr = lang === "tr";

  const { title } = dictionary.support.faq;
  const description = dictionary.support.hero.subtitle;

  return {
    title: `${title} | Deniko`,
    description,
    alternates: {
      canonical: `/${lang}/faq`,
      languages: {
        "tr-TR": `/tr/faq`,
        "en-US": `/en/faq`,
      },
    },
    openGraph: {
      title: `${title} | Deniko`,
      description,
      url: `${env.NEXT_PUBLIC_SITE_URL}/${lang}/faq`,
      locale: isTr ? "tr_TR" : "en_US",
      type: "website",
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();

  // JSON-LD for FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Object.values(dictionary.support.faq.items)
      .flat()
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
  };

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar lang={lang} dictionary={dictionary} user={session?.user} />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16 lg:py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl dark:text-white">
            {dictionary.support.faq.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {dictionary.support.hero.subtitle}
          </p>
        </div>

        <FAQSection dictionary={dictionary} />
      </section>

      <Footer lang={lang} dictionary={dictionary} />
    </main>
  );
}
