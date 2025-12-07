import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";
  const baseUrl = "https://deniko.net";
  const pathname = "/dashboard/finance";

  return {
    title: isTr ? "Finans | Deniko" : "Finance | Deniko",
    description: isTr
      ? "Finansal durum ve ödeme takibi."
      : "Financial status and payment tracking.",
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

export default async function FinancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.nav.finance}
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.nav.finance}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Finance content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
