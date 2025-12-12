"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Loader2,
  User,
  GraduationCap,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser } from "@/app/actions/auth";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";

const PhoneInput = dynamic(
  () => import("@/components/ui/phone-input").then((mod) => mod.PhoneInput),
  {
    ssr: false,
    loading: () => <Input disabled className="opacity-50" />,
  }
);

import type { Dictionary } from "@/types/i18n";

interface RegisterFormProps {
  dictionary: Dictionary;
  lang: string;
}

export function RegisterForm({ dictionary, lang }: RegisterFormProps) {
  const d = dictionary.auth.register;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerSchema = z
    .object({
      firstName: z.string().min(2, d.validation.first_name_min),
      lastName: z.string().min(2, d.validation.last_name_min),
      email: z.string().email(d.validation.email_invalid),
      phoneNumber: z.string().regex(/^\+\d{10,15}$/, d.validation.phone_min),
      role: z.enum(["TEACHER", "STUDENT"], {
        message: d.validation.role_required,
      }),
      password: z
        .string()
        .min(8, d.validation.password_min)
        .regex(/[A-Z]/, d.validation.password_regex)
        .regex(/[a-z]/, d.validation.password_regex)
        .regex(/[0-9]/, d.validation.password_regex)
        .regex(/[^A-Za-z0-9]/, d.validation.password_regex),
      confirmPassword: z.string(),
      terms: z.boolean().refine((val) => val === true, {
        message: dictionary.legal.validation_error,
      }),
      marketingConsent: z.boolean().optional(),
      preferredTimezone: z.string().optional(),
      preferredCountry: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: d.validation.password_mismatch,
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: undefined,
      password: "",
      confirmPassword: "",
      terms: false,
      marketingConsent: false,
      preferredTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredCountry: navigator.language.split("-")[1] || "US",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      try {
        // Ensure browser values are set if not already
        const payload = {
          ...values,
          preferredTimezone:
            values.preferredTimezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferredCountry:
            values.preferredCountry ||
            (navigator.language.split("-")[1] || "US").toUpperCase(),
        };

        const result = await registerUser(payload, lang);
        if (result.success) {
          setSuccess(true);
          toast.success(d.success_title);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error(dictionary.common.error_occurred);
      }
    });
  }
  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {d.success_title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">{d.success_desc}</p>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-11 w-full dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <Link href={`/${lang}/login`}>{d.login_link}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white">
                  {d.role_select}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value="STUDENT"
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="border-muted hover:text-accent-foreground flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 bg-white p-4 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#2062A3] peer-focus-visible:ring-offset-2 peer-data-[state=checked]:border-[#2062A3] peer-data-[state=checked]:text-[#2062A3] hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:peer-focus-visible:ring-blue-500 dark:peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:text-blue-400 dark:hover:bg-slate-900">
                        <GraduationCap className="mb-3 h-8 w-8" />
                        <span className="text-lg font-bold">{d.student}</span>
                        <span className="text-muted-foreground mt-1 text-center text-sm">
                          {d.student_desc}
                        </span>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value="TEACHER"
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="border-muted hover:text-accent-foreground flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 bg-white p-4 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#2062A3] peer-focus-visible:ring-offset-2 peer-data-[state=checked]:border-[#2062A3] peer-data-[state=checked]:text-[#2062A3] hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:peer-focus-visible:ring-blue-500 dark:peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:text-blue-400 dark:hover:bg-slate-900">
                        <User className="mb-3 h-8 w-8" />
                        <span className="text-lg font-bold">{d.teacher}</span>
                        <span className="text-muted-foreground mt-1 text-center text-sm">
                          {d.teacher_desc}
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.first_name}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={d.first_name}
                      autoComplete="given-name"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.last_name}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={d.last_name}
                      autoComplete="family-name"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.email}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={dictionary.auth.placeholders.email}
                      type="email"
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
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.phone}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      autoComplete="tel"
                      className="h-11"
                      labels={dictionary.common.phone_input}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.password}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={dictionary.auth.placeholders.password}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d.password_confirm}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={dictionary.auth.placeholders.password}
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
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
          </div>

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-slate-200 p-3 transition-all duration-200 hover:border-[#2062A3]/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-blue-500/50 dark:hover:bg-slate-900">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 border-2 border-slate-300 transition-all duration-200 data-[state=checked]:border-[#2062A3] data-[state=checked]:bg-[#2062A3] dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
                  />
                </FormControl>
                <div className="flex-1 leading-none">
                  <FormLabel className="block cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400">
                    {dictionary.legal.accept_terms
                      .split(/(\[.*?\])/g)
                      .map((part: string, i: number) => {
                        if (part.startsWith("[") && part.endsWith("]")) {
                          const content = part.slice(1, -1);
                          const href =
                            content === dictionary.legal.terms_title
                              ? `/${lang}/legal/terms`
                              : `/${lang}/legal/privacy`;
                          return (
                            <Link
                              key={i}
                              href={href}
                              target="_blank"
                              className="font-bold text-[#2062A3] transition-colors hover:text-[#1a4f83] hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {content}
                            </Link>
                          );
                        }
                        return part;
                      })}
                  </FormLabel>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketingConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-slate-200 p-3 transition-all duration-200 hover:border-[#2062A3]/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-blue-500/50 dark:hover:bg-slate-900">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 border-2 border-slate-300 transition-all duration-200 data-[state=checked]:border-[#2062A3] data-[state=checked]:bg-[#2062A3] dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
                  />
                </FormControl>
                <div className="flex-1 leading-none">
                  <FormLabel className="block cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400">
                    {dictionary.legal.marketing_consent}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-12 w-full bg-[#2062A3] text-lg transition-colors hover:bg-[#1a4f83] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {d.submitting}
              </>
            ) : (
              d.submit
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        {d.have_account}{" "}
        <Link
          href={`/${lang}/login`}
          className="font-semibold text-[#2062A3] hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          {d.login_link}
        </Link>
      </div>
    </div>
  );
}
