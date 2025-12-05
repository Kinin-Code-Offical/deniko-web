import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { cookiesContent } from "@/lib/legal-content";
import { PrintButton } from "@/components/ui/print-button";
import { LegalSection } from "@/components/ui/legal-section";
import { Cookie } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: isTr ? "Çerez Politikası | Deniko" : "Cookie Policy | Deniko",
    description: isTr
      ? "Deniko Çerez Politikası ve çerez kullanım detayları."
      : "Deniko Cookie Policy and cookie usage details.",
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const content =
    cookiesContent[lang as keyof typeof cookiesContent] || cookiesContent.en;

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
      {/* Document Header */}
      <div className="border-b border-slate-100 bg-slate-50/80 p-8 backdrop-blur-sm md:p-12 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 print:hidden">
            <Cookie className="h-7 w-7" />
          </div>
          <PrintButton label={lang === "tr" ? "Yazdır" : "Print"} />
        </div>

        <h1 className="mb-4 text-3xl leading-tight font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
          {content.title}
        </h1>
      </div>

      {/* Document Content */}
      <div className="p-8 md:p-12">
        <div className="max-w-none">
          <div className="mb-12 rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8 dark:border-blue-900/20 dark:bg-blue-900/10">
            <p className="text-lg leading-relaxed font-medium text-slate-700 md:text-xl dark:text-slate-200">
              {content.intro}
            </p>
          </div>

          <div className="space-y-2">
            {content.sections.map((section, index) => (
              <LegalSection
                key={index}
                title={section.title}
                content={section.content}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
