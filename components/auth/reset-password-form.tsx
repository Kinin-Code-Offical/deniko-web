"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import type { Locale } from "@/i18n-config";
import Link from "next/link";
import { useTimeout } from "@/lib/hooks/use-timeout";

// Password strength regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

import type { Dictionary } from "@/types/i18n";

interface ResetPasswordFormProps {
  dictionary: Dictionary;
  lang: Locale;
  token: string;
}

export function ResetPasswordForm({
  dictionary,
  lang,
  token,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useTimeout(
    () => {
      router.push(`/${lang}/login`);
    },
    success ? 3000 : null
  );

  const formSchema = z
    .object({
      password: z.string().regex(passwordRegex, {
        message: dictionary.auth.register.validation.password_regex,
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: dictionary.auth.register.validation.password_mismatch,
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword(token, values.password, lang);

      if (!result.success) {
        setError(result.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(dictionary.auth.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 text-center duration-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {dictionary.auth.reset_password.success_title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {dictionary.auth.reset_password.success_desc}
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-[#2062A3] hover:bg-[#1a4f83] dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Link href={`/${lang}/login`}>{dictionary.auth.login.submit}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {dictionary.auth.reset_password.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {dictionary.auth.reset_password.desc}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-slate-200">
                  {dictionary.auth.register.password}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={dictionary.auth.placeholders.password}
                      autoComplete="new-password"
                      className="pr-10 pl-10 dark:border-slate-800 dark:bg-slate-950"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-slate-200">
                  {dictionary.auth.register.confirm_password}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={dictionary.auth.placeholders.password}
                      autoComplete="new-password"
                      className="pr-10 pl-10 dark:border-slate-800 dark:bg-slate-950"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#2062A3] hover:bg-[#1a4f83] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {dictionary.common.loading}
              </>
            ) : (
              dictionary.auth.reset_password.submit
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
