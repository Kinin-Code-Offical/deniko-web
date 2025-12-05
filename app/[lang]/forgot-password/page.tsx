import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: isTr ? "Şifremi Unuttum | Deniko" : "Forgot Password | Deniko",
    description: isTr
      ? "Şifrenizi mi unuttunuz? E-posta adresinizle şifrenizi sıfırlayın."
      : "Forgot your password? Reset it with your email address.",
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row dark:bg-slate-950">
      {/* Left Panel - Visual & Brand */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#2062A3] p-12 transition-colors duration-300 md:flex dark:bg-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        {/* Logo & Back Button */}
        <div className="relative z-10 flex flex-col gap-6">
          <Link
            href={`/${lang}`}
            className="inline-flex w-fit items-center text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dictionary.common?.back_to_home ||
              dictionary.auth.login.back_to_home}
          </Link>
          <div className="flex items-center gap-2 text-white">
            <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
              <DenikoLogo className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Deniko</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-md">
          <h2 className="mb-4 text-3xl font-bold text-white">
            {dictionary.auth.forgot_password.title}
          </h2>
          <p className="text-lg leading-relaxed text-blue-100">
            {dictionary.auth.forgot_password.desc}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-200">
          © 2025 Deniko. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="animate-in slide-in-from-right-4 relative flex flex-1 flex-col bg-gradient-to-b from-white via-blue-50/60 to-white transition-colors duration-700 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/${lang}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                aria-label={
                  dictionary.common?.back_to_home ||
                  dictionary.auth.login.back_to_home
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href={`/${lang}`} className="flex items-center gap-2">
                <div className="rounded-xl bg-[#2062A3] p-1.5 shadow-sm dark:bg-blue-600">
                  <DenikoLogo className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold tracking-tight text-[#2062A3] dark:text-blue-400">
                  Deniko
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle labels={dictionary.theme} />
              <LanguageSwitcher />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pt-2 pb-4 text-xs text-slate-500 dark:text-slate-400">
            <span>{dictionary.auth.forgot_password.mobile_hint}</span>
          </div>
        </div>

        {/* Desktop Language Switcher */}
        <div className="absolute top-6 right-6 z-20 hidden items-center gap-2 md:flex">
          <ThemeToggle labels={dictionary.theme} />
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2062A3] dark:bg-blue-900/30 dark:text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {dictionary.auth.forgot_password.chip}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                {dictionary.auth.forgot_password.title}
              </h1>
              <p className="text-sm text-slate-500 md:text-base dark:text-slate-400">
                {dictionary.auth.forgot_password.desc}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
              <ForgotPasswordForm dictionary={dictionary} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
