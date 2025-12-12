"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Globe, Loader2 } from "lucide-react";
import { i18n } from "@/i18n-config";
import { useTimeout } from "@/lib/hooks/use-timeout";

interface LanguageSwitcherProps {
  currentLocale?: string;
  onSelect?: () => void;
}

function setLanguageCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitcher({
  currentLocale,
  onSelect,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Use custom hook to handle timeout safely and avoid synchronous state update warning
  useTimeout(() => setMounted(true), 0);

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const handleLanguageChange = (locale: string) => {
    setLanguageCookie(locale);

    if (onSelect) {
      onSelect();
    }

    startTransition(() => {
      router.replace(redirectedPathName(locale));
      router.refresh();
    });
  };

  const localeLabels: Record<string, string> = {
    en: "English",
    tr: "Türkçe",
  };

  // Always render the button structure to prevent layout shift
  // If not mounted, we just render a non-interactive version or default state
  // but we keep the same dimensions and styling.
  const activeLocale =
    currentLocale ?? (pathname?.split("/")[1] || i18n.defaultLocale);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={!mounted || isPending}
          className={`h-11 min-w-[140px] gap-2 rounded-full border-slate-200/80 bg-transparent px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-100 data-[state=open]:ring-2 data-[state=open]:ring-[#1d4f87]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-blue-400 dark:hover:bg-slate-900`}
          suppressHydrationWarning
        >
          {isPending || !mounted ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#1d4f87] dark:text-blue-400" />
          ) : (
            <Globe className="h-4 w-4 text-[#1d4f87] dark:text-blue-400" />
          )}
          <span className="flex-1 text-left">
            {localeLabels[activeLocale] ?? activeLocale.toUpperCase()}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-blue-400/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl border-slate-100 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950"
      >
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            disabled={isPending}
            className={`flex items-center gap-2 py-3 text-sm dark:focus:bg-slate-900 ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Check
              className={`h-4 w-4 text-[#1d4f87] dark:text-blue-400 ${activeLocale === locale ? "opacity-100" : "opacity-0"}`}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {localeLabels[locale]}
              </span>
              <span className="text-[11px] tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
                {locale}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
