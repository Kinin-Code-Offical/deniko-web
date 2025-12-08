import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { FAQSection } from "@/components/support/faq-section";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";
import { env } from "@/lib/env";

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
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} dictionary={dictionary} />
      <main className="flex-1">
        {/* Hero Section with Gradient */}
        <section className="relative overflow-hidden bg-slate-50 py-20 dark:bg-slate-900/50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center" />
          <div className="relative z-10 container text-center">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl dark:from-white dark:to-slate-400">
                {dictionary.support.faq.title}
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
                {dictionary.support.hero.subtitle}
              </p>
            </div>
          </div>
        </section>

        <div className="container -mt-8 space-y-16 pb-20">
          {/* FAQ Section */}
          <FAQSection dictionary={dictionary} />
        </div>
      </main>
      <Footer lang={lang} dictionary={dictionary} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
