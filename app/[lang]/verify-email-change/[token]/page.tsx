import { verifyEmailChangeAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";

export default async function VerifyEmailChangePage({
  params,
}: {
  params: Promise<{ lang: Locale; token: string }>;
}) {
  const { lang, token } = await params;
  const dictionary = await getDictionary(lang);
  const result = await verifyEmailChangeAction(token, lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 text-center shadow-lg">
        {result.success ? (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">
              {dictionary.verify_email_change.success_title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.verify_email_change.success_description}
            </p>
            <Button asChild className="w-full">
              <Link href={`/${lang}/login`}>
                {dictionary.verify_email_change.login_button}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">
              {dictionary.verify_email_change.error_title}
            </h1>
            <p className="text-muted-foreground">
              {result.error || dictionary.verify_email_change.error_description}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/settings`}>
                {dictionary.verify_email_change.back_button}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
