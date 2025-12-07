import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: {
      default: isTr ? "Panel" : "Dashboard",
      template: `%s | Deniko`,
    },
    description: isTr
      ? "Deniko yönetim paneli ile derslerinizi ve öğrencilerinizi yönetin."
      : "Manage your lessons and students with Deniko dashboard.",
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

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
      studentProfile: true,
    },
  });

  if (!user) {
    redirect(`/${lang}/login`);
  }

  // Enforce Onboarding Completion
  if (!user.isOnboardingCompleted) {
    redirect(`/${lang}/onboarding`);
  }

  return (
    <DashboardShell user={user} dictionary={dictionary} lang={lang}>
      {children}
    </DashboardShell>
  );
}
