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
  const dict = await getDictionary(lang);

  return {
    title: {
      default: dict.metadata.dashboard.title,
      template: `%s | ${dict.common.brand_name}`,
    },
    description: dict.metadata.dashboard.description,
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

  // Sign avatar URL if needed
  let imageUrl = user.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    // Use API URL for internal images
    // We don't need full URL here as it's used in client component (UserNav) which handles relative paths
    // But UserNav expects a string.
    // Actually UserNav uses getAvatarUrl internally too!
    // But here we are passing it as a prop.
    // Let's pass the relative API path.
    imageUrl = `/api/avatar/${user.id}`;
  }

  const userWithSignedUrl = {
    ...user,
    image: imageUrl,
  };

  return (
    <DashboardShell
      user={userWithSignedUrl}
      dictionary={dictionary}
      lang={lang}
    >
      {children}
    </DashboardShell>
  );
}
