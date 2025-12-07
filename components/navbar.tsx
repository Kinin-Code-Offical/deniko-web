"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ArrowRight, BookOpen, LogIn, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/types/i18n";

interface NavbarProps {
  lang: string;
  dictionary: Dictionary;
}

export function Navbar({ lang, dictionary }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    // Close mobile menu when navigating to a new route
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] border-b bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        {/* Logo */}
        <Link
          href={`/${lang}`}
          className="inline-flex items-center leading-none"
        >
          <DenikoLogo className="-mr-2.5 h-12 w-12 text-[#2062A3] md:h-14 md:w-14 dark:text-blue-400" />
          <span className="text-[26px] font-bold tracking-tight text-[#2062A3] md:text-[32px] dark:text-blue-400">
            {dictionary.common.app_name.substring(1)}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {isClient && <ThemeToggle labels={dictionary.common.theme} />}
          <LanguageSwitcher currentLocale={lang} />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className="h-11 px-4 text-[15px] font-medium text-slate-600 hover:text-[#2062A3] dark:text-slate-300 dark:hover:text-blue-400"
            >
              <Link
                href={`/${lang}/login`}
                className="inline-flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>{dictionary.home.login}</span>
              </Link>
            </Button>
            <Button
              asChild
              className="relative h-11 overflow-hidden rounded-full bg-gradient-to-r from-[#1d4f87] via-[#1a4b7d] to-[#113055] px-6 text-[15px] font-semibold text-white shadow-lg shadow-blue-900/20 hover:opacity-95"
            >
              <Link
                href={`/${lang}/register`}
                className="inline-flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>{dictionary.home.get_started}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          {isClient ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  aria-label={dictionary.navbar.menu_open}
                  className="h-11 gap-2 rounded-full bg-[#1d4f87] px-5 text-white shadow-md shadow-blue-900/20 transition-all hover:bg-[#163b65] focus-visible:ring-2 focus-visible:ring-[#1d4f87] focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-blue-400"
                >
                  <Menu className="h-5 w-5" strokeWidth={2.4} />
                  <span className="text-sm font-semibold tracking-wide">
                    {dictionary.navbar.menu}
                  </span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[250px] flex-col overflow-y-auto border-l bg-white sm:w-[300px] dark:border-slate-800 dark:bg-slate-950"
              >
                <SheetTitle className="sr-only">
                  {dictionary.navbar.mobile_menu_title}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {dictionary.navbar.mobile_menu_desc}
                </SheetDescription>
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#2062A3] p-1.5 dark:bg-blue-600">
                      <DenikoLogo className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#2062A3] dark:text-blue-400">
                      {dictionary.common.app_name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="h-12 w-full justify-start text-base dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link href={`/${lang}/login`}>
                        {dictionary.home.login}
                      </Link>
                    </Button>
                    <Button
                      className="h-12 w-full justify-start bg-[#2062A3] text-base hover:bg-[#1a4f83] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link href={`/${lang}/register`}>
                        {dictionary.home.get_started}
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto flex flex-col gap-6">
                  {/* Settings */}
                  <div className="space-y-4 border-t pt-6 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm font-medium dark:text-slate-400">
                        {dictionary.navbar.theme}
                      </span>
                      {isClient && (
                        <ThemeToggle labels={dictionary.common.theme} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm font-medium dark:text-slate-400">
                        {dictionary.navbar.language}
                      </span>
                      <LanguageSwitcher
                        currentLocale={lang}
                        onSelect={() => setOpen(false)}
                      />
                    </div>
                  </div>

                  {/* Legal Links */}
                  <div className="border-t pt-6 pb-2 dark:border-slate-800">
                    <h4 className="mb-3 px-2 text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-white">
                      {dictionary.navbar.legal}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/${lang}/legal`}
                        className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2062A3] dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        {dictionary.legal.center}
                      </Link>
                      <Link
                        href={`/${lang}/legal/terms`}
                        className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2062A3] dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        {dictionary.navbar.terms}
                      </Link>
                      <Link
                        href={`/${lang}/legal/privacy`}
                        className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2062A3] dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        {dictionary.navbar.privacy}
                      </Link>
                      <Link
                        href={`/${lang}/legal/cookies`}
                        className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2062A3] dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        {dictionary.legal.nav.cookies}
                      </Link>
                      <Link
                        href={`/${lang}/legal/kvkk`}
                        className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2062A3] dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        {dictionary.legal.nav.kvkk}
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              size="lg"
              aria-label={lang === "tr" ? "Menüyü aç" : "Open menu"}
              className="h-11 cursor-default rounded-full bg-[#1d4f87] px-5 text-white opacity-80"
              disabled
            >
              <Menu className="h-5 w-5" strokeWidth={2.4} />
              <span className="text-sm font-semibold tracking-wide">
                {lang === "tr" ? "Menü" : "Menu"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
