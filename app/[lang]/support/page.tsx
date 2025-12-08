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
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} dictionary={dictionary} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 py-16 dark:bg-slate-900/50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center" />
          <div className="relative z-10 container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl dark:from-white dark:to-slate-400">
                {contact.title}
              </h1>
              <p className="text-muted-foreground mt-4 text-xl">
                {contact.subtitle}
              </p>
            </div>
          </div>
        </section>

        <div className="container max-w-6xl py-12">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Contact Info Side */}
            <div className="space-y-6 lg:col-span-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Card className="group overflow-hidden transition-all hover:border-[#2062A3]/30 hover:shadow-md dark:hover:border-blue-400/30">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="rounded-xl bg-blue-50 p-3 text-[#2062A3] transition-colors group-hover:bg-[#2062A3] group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {contact.info.email_label}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {contact.info.email}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="group overflow-hidden transition-all hover:border-[#2062A3]/30 hover:shadow-md dark:hover:border-blue-400/30">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="rounded-xl bg-blue-50 p-3 text-[#2062A3] transition-colors group-hover:bg-[#2062A3] group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {contact.info.chat_label}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {contact.info.chat_desc}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="group overflow-hidden transition-all hover:border-[#2062A3]/30 hover:shadow-md dark:hover:border-blue-400/30">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="rounded-xl bg-blue-50 p-3 text-[#2062A3] transition-colors group-hover:bg-[#2062A3] group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {contact.info.phone_label}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {contact.info.phone_desc}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Additional Info or Illustration could go here */}
              <div className="bg-muted/30 rounded-2xl border border-dashed p-6">
                <p className="text-muted-foreground text-center text-sm">
                  {dictionary.support.cta.subtitle}
                </p>
              </div>
            </div>

            {/* Contact Form Side */}
            <div className="lg:col-span-7">
              <div className="bg-card rounded-2xl border p-6 shadow-lg shadow-slate-200/50 sm:p-8 dark:shadow-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {dictionary.support.contact.form.submit}
                  </h2>
                  <p className="text-muted-foreground">
                    {dictionary.support.contact.subtitle}
                  </p>
                </div>
                <SupportForm dictionary={dictionary} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer lang={lang} dictionary={dictionary} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
    </div>
  );
}
