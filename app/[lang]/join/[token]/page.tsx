import { auth } from "@/auth";
import { getInviteDetails } from "@/app/actions/student";
import { getDictionary } from "@/lib/get-dictionary";
import JoinClient from "./join-client";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import Link from "next/link";
import { AlertCircle, LogIn, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; token: string }>;
}): Promise<Metadata> {
  const { lang, token } = await params;
  const dict = await getDictionary(lang);
  const baseUrl = "https://deniko.net";
  const pathname = `/join/${token}`;

  return {
    title: dict.metadata.join.title,
    description: dict.metadata.join.description,
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

export default async function JoinPage({
  params,
}: {
  params: Promise<{ lang: "en" | "tr"; token: string }>;
}) {
  const { lang, token } = await params;
  const session = await auth();
  const dict = await getDictionary(lang);

  const inviteDetails = await getInviteDetails(token);

  // Error State: Invalid Token
  if (!inviteDetails) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle labels={dict.theme} />
          <LanguageSwitcher currentLocale={lang} />
        </div>
        <Card className="border-destructive/50 w-full max-w-md shadow-lg dark:bg-slate-900">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle className="text-destructive">
              {dict.dashboard.join.error}
            </CardTitle>
            <CardDescription>{dict.dashboard.join.error_desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild variant="outline">
              <Link href={`/${lang}`}>{dict.common.back_to_home}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State: Already Claimed
  if (inviteDetails.isClaimed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle labels={dict.theme} />
          <LanguageSwitcher currentLocale={lang} />
        </div>
        <Card className="w-full max-w-md shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
            <CardTitle className="text-yellow-600 dark:text-yellow-500">
              {dict.dashboard.join.already_used}
            </CardTitle>
            <CardDescription>
              {dict.dashboard.join.already_used_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild variant="outline">
              <Link href={`/${lang}/login`}>{dict.dashboard.nav.logout}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 1. User NOT Logged In
  if (!session?.user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle labels={dict.theme} />
          <LanguageSwitcher currentLocale={lang} />
        </div>
        <Card className="w-full max-w-md shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-4 w-fit rounded-xl bg-[#2062A3] p-3 shadow-md dark:bg-blue-600">
              <DenikoLogo className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2062A3] dark:text-blue-400">
              {dict.dashboard.join.welcome_title}
            </CardTitle>
            <CardDescription className="text-base dark:text-slate-400">
              {dict.dashboard.join.invite_desc.replace(
                "{teacher}",
                inviteDetails.teacherName || dict.dashboard.join.unknown_teacher
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              <p className="text-center font-medium">
                {dict.dashboard.join.login_desc}
              </p>
            </div>
            <div className="grid gap-3">
              <Button asChild size="lg" className="w-full font-semibold">
                <Link href={`/${lang}/login?callbackUrl=/join/${token}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {dict.dashboard.join.login_button}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full font-semibold"
              >
                <Link href={`/${lang}/register?callbackUrl=/join/${token}`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {dict.dashboard.join.register_button}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. User IS Logged In -> Show Client Component
  const userProfile = await db.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  // Error State: Teacher cannot join
  if (userProfile?.role === "TEACHER") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle labels={dict.theme} />
          <LanguageSwitcher currentLocale={lang} />
        </div>
        <Card className="border-destructive/50 w-full max-w-md shadow-lg dark:bg-slate-900">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle className="text-destructive">
              {dict.dashboard.join.teacher_cannot_join}
            </CardTitle>
            <CardDescription>
              {dict.dashboard.join.teacher_cannot_join_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild variant="outline">
              <Link href={`/${lang}/dashboard`}>
                {dict.dashboard.nav.dashboard}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <JoinClient
      dict={dict}
      inviteDetails={inviteDetails}
      userProfile={userProfile}
      token={token}
      lang={lang}
    />
  );
}
