import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { SupportForm } from "@/components/support/support-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, MessageSquare, Phone } from "lucide-react";
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

  const { title } = dictionary.support.contact;
  const description = dictionary.support.contact.subtitle;

  return {
    title: `${title} | Deniko`,
    description,
    alternates: {
      canonical: `/${lang}/support`,
      languages: {
        "tr-TR": `/tr/support`,
        "en-US": `/en/support`,
      },
    },
    openGraph: {
      title: `${title} | Deniko`,
      description,
      url: `${env.NEXT_PUBLIC_SITE_URL}/${lang}/support`,
      locale: isTr ? "tr_TR" : "en_US",
      type: "website",
    },
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();
  const { contact } = dictionary.support;

  // JSON-LD for ContactPage
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: contact.title,
    description: contact.subtitle,
    mainEntity: {
      "@type": "Organization",
      name: "Deniko",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: contact.info.phone_desc,
          contactType: "customer support",
          email: contact.info.email,
          availableLanguage: ["English", "Turkish"],
        },
      ],
    },
  };

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <Navbar lang={lang} dictionary={dictionary} user={session?.user} />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16 lg:py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl dark:text-white">
            {contact.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {contact.subtitle}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[350px_1fr]">
          {/* Left Column: Contact Info */}
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    {contact.info.email_label}
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {contact.info.email}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    {contact.info.chat_label}
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {contact.info.chat_desc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    {contact.info.phone_label}
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {contact.info.phone_desc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
              <p className="text-sm text-slate-500">
                {dictionary.support.cta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <Card className="border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {dictionary.support.contact.form.submit}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {dictionary.support.contact.subtitle}
              </p>
            </div>
            <SupportForm dictionary={dictionary} />
          </Card>
        </div>
      </section>

      <Footer lang={lang} dictionary={dictionary} />
    </main>
  );
}
