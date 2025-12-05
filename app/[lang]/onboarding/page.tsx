import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import { env } from "@/lib/env";
import { jwtVerify } from "jose";
import { OnboardingClientPage } from "./client-page";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: isTr ? "Kurulum | Deniko" : "Onboarding | Deniko",
    description: isTr
      ? "Hesap kurulumunuzu tamamlayın ve Deniko'yu kullanmaya başlayın."
      : "Complete your account setup and start using Deniko.",
  };
}

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  const { token } = await searchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dictionary = await getDictionary(lang as any);

  let session = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(env.AUTH_SECRET);
      await jwtVerify(token, secret);
    } catch {
      redirect(`/${lang}/login`);
    }
  } else {
    session = await auth();
    if (!session?.user?.id) {
      redirect(`/${lang}/login`);
    }

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!dbUser) {
      redirect(`/${lang}/login?error=SessionMismatch`);
    }

    // Critical Check: If onboarding is completed, redirect to dashboard
    if (dbUser.isOnboardingCompleted) {
      redirect(`/${lang}/dashboard`);
    }
  }

  return <OnboardingClientPage dictionary={dictionary} lang={lang} />;
}
