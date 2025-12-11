"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/app/actions/auth";
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
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ResendAlert } from "@/components/auth/resend-alert";

import type { Dictionary } from "@/types/i18n";

interface LoginFormProps {
  dictionary: Dictionary;
  lang: string;
}

export function LoginForm({ dictionary, lang }: LoginFormProps) {
  const d = dictionary.auth.login;
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const formSchema = z.object({
    email: z.string().email(d.validation.email_invalid),
    password: z.string().min(1, d.validation.password_required),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setUnverifiedEmail(null); // Reset state on new attempt
    startTransition(async () => {
      try {
        const result = await login(values, lang);
        if (result && !result.success) {
          if (result.error === "NOT_VERIFIED" && result.email) {
            setUnverifiedEmail(result.email);
          }
          toast.error(result.message);
        }
      } catch {
        // Verify if it's a redirect error (usually has a DIGEST property or just ignore)
        // Since we redirect from server, this catch block might catch the redirect.
        // We can simply ignore it as the browser will navigate away.
      }
    });
  }

  return (
    <div className="w-full space-y-6">
      {unverifiedEmail && (
        <ResendAlert
          email={unverifiedEmail}
          dictionary={dictionary}
          lang={lang}
        />
      )}

      <div className="space-y-6">
        <GoogleLoginButton
          text={d.google_login}
          googleLabel={dictionary.common.google}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {d.or_email}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.email}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={dictionary.auth.placeholders.email}
                      autoComplete="username"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{d.password}</FormLabel>
                    <Link
                      href={`/${lang}/forgot-password`}
                      className="text-sm font-medium text-[#2062A3] hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {d.forgot_password_link}
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={dictionary.auth.placeholders.password}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...field}
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        aria-label={
                          dictionary.common.toggle_password_visibility
                        }
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Eye className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-11 w-full bg-[#2062A3] hover:bg-[#1a4f83] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {d.submit}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          {d.no_account}{" "}
          <Link
            href={`/${lang}/register`}
            className="font-semibold text-[#2062A3] hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {d.register_link}
          </Link>
        </div>
      </div>
    </div>
  );
}
