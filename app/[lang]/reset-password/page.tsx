import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const baseUrl = "https://deniko.net";
  const pathname = "/reset-password";

  return {
    title: dictionary.metadata.reset_password.title,
    description: dictionary.metadata.reset_password.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}${pathname}`,
      languages: {
        "tr-TR": `/tr${pathname}`,
        "en-US": `/en${pathname}`,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  const { token } = await searchParams;
  const dictionary = await getDictionary(lang);

  if (!token) {
    redirect(`/${lang}/login`);
  }

  // Server-side token validation
  const existingToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  const isInvalid = !existingToken || new Date() > existingToken.expires;

  if (isInvalid) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {dictionary.auth.reset_password.invalid_link_title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {dictionary.auth.reset_password.invalid_link_desc}
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-[#2062A3] hover:bg-[#1a4f83] dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Link href={`/${lang}/forgot-password`}>
              {dictionary.auth.forgot_password.submit}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Link href={`/${lang}/login`}>
              {dictionary.auth.login.back_to_home}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="relative z-10">
          <Link
            href={`/${lang}`}
            className="mb-8 inline-flex items-center text-white transition-colors hover:text-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dictionary.auth.login.back_to_home}
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm">
              <DenikoLogo className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              {dictionary.common.app_name}
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg">
          <h1 className="mb-4 text-4xl font-bold text-white">
            {dictionary.auth.reset_password.title}
          </h1>
          <p className="text-lg leading-relaxed text-blue-100">
            {dictionary.auth.reset_password.desc}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-200">
          {dictionary.common.copyright_long}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex flex-1 flex-col bg-slate-50 transition-colors dark:bg-slate-950">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b bg-white p-6 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              aria-label={dictionary.auth.login.back_to_home}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <div className="rounded-lg bg-[#2062A3] p-1.5 dark:bg-blue-600">
                <DenikoLogo className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2062A3] dark:text-blue-400">
                {dictionary.common.app_name}
              </span>
            </Link>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Desktop Language Switcher */}
        <div className="absolute top-0 right-0 z-20 hidden justify-end p-6 md:flex">
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:border-none md:bg-transparent md:p-0 md:shadow-none dark:border-slate-800 dark:bg-slate-900 md:dark:bg-transparent">
            <ResetPasswordForm
              dictionary={dictionary}
              lang={lang}
              token={token}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
