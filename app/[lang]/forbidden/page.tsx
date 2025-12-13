import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { AnimatedIcon } from "./animated-icon";

interface ForbiddenPageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: ForbiddenPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.error_pages.forbidden.title,
    description: dictionary.error_pages.forbidden.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ForbiddenPage({ params }: ForbiddenPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();
  const dict = dictionary.error_pages.forbidden;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 font-sans transition-colors dark:bg-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-red-200/35 blur-[120px] dark:bg-red-900/25" />
        <div className="absolute top-[40%] -right-[10%] h-[40%] w-[40%] rounded-full bg-orange-200/35 blur-[120px] dark:bg-orange-900/30" />
        <div className="absolute bottom-[10%] left-[20%] h-[30%] w-[30%] rounded-full bg-yellow-200/35 blur-[100px] dark:bg-yellow-900/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <div className="mb-10 flex justify-center">
          <AnimatedIcon />
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          {dict.title}
        </h1>

        <p className="mx-auto mb-10 max-w-md text-lg font-medium text-slate-600 dark:text-slate-300">
          {dict.description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-slate-200 bg-white/50 text-slate-700 hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
          >
            <Link href={`/${lang}`}>
              <Home className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {dict.backToHome}
            </Link>
          </Button>

          {session?.user && (
            <Button
              asChild
              size="lg"
              className="bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-red-600/35 dark:bg-red-600 dark:hover:bg-red-500"
            >
              <Link href={`/${lang}/dashboard`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {dict.backToDashboard}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
