"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail, resendVerificationEmailAction } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/types/i18n";

interface VerifyClientProps {
  lang: string;
  dictionary: Dictionary;
}

export function VerifyClient({ lang, dictionary }: VerifyClientProps) {
  const d = dictionary.auth.verify_page;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [emailToResend, setEmailToResend] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResend] = useTransition();
  const firedRef = useRef(false);

  useEffect(() => {
    if (success || error || firedRef.current) return;

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(d.missing_token);
      return;
    }

    firedRef.current = true;

    startTransition(async () => {
      const result = await verifyEmail(token, lang);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
        if (result.email) setEmailToResend(result.email);
      }
    });
  }, [token, success, error, lang, d]);

  const handleResend = () => {
    if (!emailToResend) return;
    startResend(async () => {
      const result = await resendVerificationEmailAction(emailToResend, lang);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {isPending ? (
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          ) : success ? (
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          )}
        </div>
        <CardTitle className="text-xl dark:text-white">
          {isPending ? d.verifying : success ? d.success_title : d.error_title}
        </CardTitle>
        <CardDescription className="mt-2 dark:text-slate-400">
          {isPending ? d.verifying_desc : success || error}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-4 pb-6">
        {!isPending && emailToResend && (
          <Button
            onClick={handleResend}
            variant="secondary"
            disabled={isResending}
            className="w-full dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {d.resend_button}
          </Button>
        )}

        {!isPending && (
          <Link href={`/${lang}/login`} className="w-full">
            <Button
              className="w-full"
              variant={success ? "default" : "outline"}
            >
              {d.back_to_login}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
