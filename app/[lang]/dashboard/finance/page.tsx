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

  return {
    title: isTr ? "Finans | Deniko" : "Finance | Deniko",
    description: isTr
      ? "Finansal durum ve ödeme takibi."
      : "Financial status and payment tracking.",
  };
}

export default async function FinancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dictionary = (await getDictionary(lang as Locale)) as any;
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
