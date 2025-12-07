import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, Cookie, Scale } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return {
    title: {
      template: `%s | ${dictionary.legal.title}`,
      default: dictionary.legal.title,
    },
    description: dictionary.legal.description,
  };
}

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  const navItems = [
    {
      href: `/${lang}/legal/terms`,
      label: dictionary.legal.nav.terms,
      icon: FileText,
    },
    {
      href: `/${lang}/legal/privacy`,
      label: dictionary.legal.nav.privacy,
      icon: Shield,
    },
    {
      href: `/${lang}/legal/cookies`,
      label: dictionary.legal.nav.cookies,
      icon: Cookie,
    },
    {
      href: `/${lang}/legal/kvkk`,
      label: dictionary.legal.nav.kvkk,
      icon: Scale,
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 transition-colors duration-300 dark:bg-slate-950 print:min-h-0 print:bg-white">
      {/* Print Header - Visible only when printing */}
      <div className="mb-8 hidden items-center gap-3 border-b px-8 pt-8 pb-4 print:flex">
        <DenikoLogo className="h-8 w-8 text-black" />
        <span className="text-2xl font-bold tracking-tight text-black">
          {dictionary.common.app_name}{" "}
          <span className="font-normal text-slate-600">
            {dictionary.legal.legal_suffix}
          </span>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 dark:bg-slate-900/80 print:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link
              href={`/${lang}`}
              className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="rounded-lg bg-blue-50 p-1.5 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30">
                <DenikoLogo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {dictionary.common.app_name}{" "}
                <span className="font-normal text-slate-400">
                  {dictionary.legal.legal_suffix}
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="mr-1 flex items-center gap-1 border-r border-slate-200 pr-2 sm:gap-2 sm:pr-3 dark:border-slate-800">
              <ThemeToggle labels={dictionary.theme} />
              <LanguageSwitcher currentLocale={lang} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="group rounded-full px-2 text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 sm:px-4 dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              <Link href={`/${lang}`}>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {dictionary.legal.nav.back_to_home}
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav (Horizontal Scroll) */}
      <div className="overflow-x-auto border-b bg-white lg:hidden dark:bg-slate-900 print:hidden">
        <div className="container mx-auto flex min-w-max items-center gap-2 px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-12 md:px-6 lg:px-8 print:max-w-none print:p-0">
        <div className="mx-auto max-w-4xl print:max-w-none">{children}</div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <DenikoLogo className="h-6 w-6 text-slate-400" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {dictionary.legal.legal_center}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {dictionary.common.copyright}{" "}
              {dictionary.legal.footer.rights_reserved}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
