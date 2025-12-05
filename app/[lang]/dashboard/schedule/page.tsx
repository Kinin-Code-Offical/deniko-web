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
    title: isTr ? "Ders Programı | Deniko" : "Schedule | Deniko",
    description: isTr
      ? "Ders programı ve takvim yönetimi."
      : "Schedule and calendar management.",
  };
}

export default async function SchedulePage({
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
          {dictionary.dashboard.nav.schedule}
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.nav.schedule}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Schedule content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
