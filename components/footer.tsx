import Link from "next/link";
import type { Dictionary } from "@/types/i18n";

interface FooterProps {
  lang: string;
  dictionary: Dictionary;
}

export function Footer({ lang, dictionary }: FooterProps) {
  return (
    <footer className="border-t bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex gap-6">
            <Link
              href={`/${lang}`}
              className="text-sm font-medium text-slate-600 hover:text-[#2062A3] hover:underline dark:text-slate-400 dark:hover:text-blue-400"
            >
              {dictionary.home.home}
            </Link>
            <Link
              href={`/${lang}/dashboard`}
              className="text-sm font-medium text-slate-600 hover:text-[#2062A3] hover:underline dark:text-slate-400 dark:hover:text-blue-400"
            >
              {dictionary.dashboard.nav.dashboard}
            </Link>
          </div>
          <div className="flex gap-6">
            <Link
              href={`/${lang}/legal/terms`}
              className="text-sm font-medium text-slate-600 hover:text-[#2062A3] hover:underline dark:text-slate-400 dark:hover:text-blue-400"
            >
              {dictionary.legal.nav.terms}
            </Link>
            <Link
              href={`/${lang}/legal/privacy`}
              className="text-sm font-medium text-slate-600 hover:text-[#2062A3] hover:underline dark:text-slate-400 dark:hover:text-blue-400"
            >
              {dictionary.legal.nav.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
