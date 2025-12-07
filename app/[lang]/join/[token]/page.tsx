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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; token: string }>;
}): Promise<Metadata> {
  const { lang, token } = await params;
  const isTr = lang === "tr";
  const baseUrl = "https://deniko.net";
  const pathname = `/join/${token}`;

  return {
    title: isTr ? "Davet | Deniko" : "Invitation | Deniko",
    description: isTr ? "Deniko'ya katılın." : "Join Deniko.",
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

  if (!inviteDetails) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-destructive">{dict.dashboard.join.error}</p>
      </div>
    );
  }

  if (inviteDetails.isClaimed) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-muted-foreground">
          {dict.dashboard.join.already_used}
        </p>
      </div>
    );
  }

  // 1. User NOT Logged In
  if (!session?.user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
        <Card className="w-full max-w-md shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-4 w-fit rounded-xl bg-[#2062A3] p-3 shadow-md dark:bg-blue-600">
              <DenikoLogo className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2062A3] dark:text-blue-400">
              {dict.dashboard.join.welcome_title}
            </CardTitle>
            <CardDescription className="text-base dark:text-slate-400">
              <span className="text-foreground font-semibold dark:text-white">
                {inviteDetails.teacherName}
              </span>{" "}
              {dict.dashboard.join.invite_desc.replace("{name}", "")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground dark:text-slate-400">
              {dict.dashboard.join.login_desc}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="h-11 w-full bg-[#2062A3] text-base hover:bg-[#1a4f83] dark:bg-blue-600 dark:hover:bg-blue-700"
              asChild
            >
              <Link href={`/${lang}/login?callbackUrl=/${lang}/join/${token}`}>
                <LogIn className="mr-2 h-4 w-4" />
                {dict.dashboard.join.login_button}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full text-base dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              asChild
            >
              <Link href={`/${lang}/register?invite=${token}`}>
                <UserPlus className="mr-2 h-4 w-4" />
                {dict.dashboard.join.register_button}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 2. User IS Logged In
  // Fetch current user's profile for comparison
  const userProfile = await db.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  return (
    <div className="container flex min-h-dvh items-center justify-center py-10">
      <JoinClient
        dict={dict}
        inviteDetails={inviteDetails}
        userProfile={userProfile}
        token={token}
      />
    </div>
  );
}
