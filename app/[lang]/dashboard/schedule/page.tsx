import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const baseUrl = "https://deniko.net";
  const pathname = "/dashboard/schedule";

  return {
    title: dictionary.metadata.schedule.title,
    description: dictionary.metadata.schedule.description,
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

export default async function SchedulePage({
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
          {dictionary.dashboard.nav.schedule}
        </h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.dashboard.schedule.new_lesson}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 md:col-span-5">
          <CardHeader>
            <CardTitle>{dictionary.dashboard.schedule.calendar}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mock Calendar View */}
            <div className="bg-muted/10 flex h-[500px] items-center justify-center rounded-md border p-4">
              <p className="text-muted-foreground">
                {dictionary.dashboard.schedule.calendar_placeholder}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2">
          <CardHeader>
            <CardTitle>{dictionary.dashboard.schedule.upcoming}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 py-1 pl-3">
                <p className="font-medium">
                  {dictionary.dashboard.schedule.math}
                </p>
                <p className="text-muted-foreground text-sm">
                  {dictionary.dashboard.schedule.mock_lesson_1}
                </p>
              </div>
              <div className="border-l-4 border-green-500 py-1 pl-3">
                <p className="font-medium">
                  {dictionary.dashboard.schedule.physics}
                </p>
                <p className="text-muted-foreground text-sm">
                  {dictionary.dashboard.schedule.mock_lesson_2}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
