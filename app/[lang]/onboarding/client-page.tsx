"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  School,
  GraduationCap,
  LogOut,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/types/i18n";

interface OnboardingClientPageProps {
  dictionary: Dictionary;
  lang: string;
}

export function OnboardingClientPage({
  dictionary,
  lang,
}: OnboardingClientPageProps) {
  const { update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<"TEACHER" | "STUDENT">("STUDENT");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmit = () => {
    if (!phoneNumber) {
      toast.error(dictionary.auth.register.validation.phone_min);
      return;
    }
    if (!password || !confirmPassword) {
      toast.error(dictionary.auth.register.validation.password_required);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(dictionary.auth.register.validation.password_mismatch);
      return;
    }
    if (password.length < 8) {
      toast.error(dictionary.auth.register.validation.password_min);
      return;
    }

    if (!termsAccepted) {
      toast.error(dictionary.legal.validation_terms);
      return;
    }

    startTransition(async () => {
      try {
        const result = await completeOnboarding({
          role,
          phoneNumber,
          password,
          confirmPassword,
          terms: termsAccepted,
          marketingConsent,
        });
        if (result.success) {
          await update({ role });
          router.push(`/${lang}/dashboard`);
          router.refresh();
        } else {
          toast.error(result.error || dictionary.common.error_occurred);
        }
      } catch {
        toast.error(dictionary.common.error_occurred);
      }
    });
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white md:flex-row">
      {/* Left Panel - Brand (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#2062A3] p-12 text-white md:flex">
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            <circle cx="90" cy="10" r="20" fill="white" />
            <circle cx="10" cy="90" r="10" fill="white" />
          </svg>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <DenikoLogo className="h-12 w-auto text-white" />
        </div>

        {/* Middle: Quote */}
        <div className="relative z-10 max-w-lg">
          <h1 className="mb-4 text-4xl leading-tight font-bold">
            {dictionary.auth.register.hero_title}
          </h1>
          <p className="text-lg text-blue-100">
            {dictionary.auth.register.hero_desc}
          </p>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10 text-sm text-blue-200">
          {dictionary.common.copyright} {dictionary.common.all_rights_reserved}
        </div>
      </div>

      {/* Right Panel - Form (Interaction) */}
      <div className="relative flex flex-1 flex-col bg-white transition-colors dark:bg-slate-950">
        {/* Desktop Language Switcher */}
        <div className="absolute top-6 right-6 z-20 hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* Mobile Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/80 p-4 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/80">
          <DenikoLogo className="h-8 w-auto text-[#2062A3] dark:text-blue-400" />
          <LanguageSwitcher />
        </div>

        {/* Center Content */}
        <div className="mx-auto my-auto flex w-full max-w-[480px] flex-col gap-8 p-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {dictionary.auth.onboarding.title}
            </h2>
            <p className="text-gray-500 dark:text-slate-400">
              {dictionary.auth.onboarding.subtitle}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="dark:text-slate-200">
                {dictionary.auth.register.role_select}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Student Card */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={role === "STUDENT"}
                  onClick={() => setRole("STUDENT")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRole("STUDENT");
                    }
                  }}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 text-center transition-all hover:border-[#2062A3] hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#2062A3] focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:focus-visible:ring-blue-500",
                    role === "STUDENT"
                      ? "border-[#2062A3] bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-700 dark:bg-slate-900"
                  )}
                >
                  {role === "STUDENT" && (
                    <div className="absolute top-2 right-2 text-[#2062A3] dark:text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-full p-3",
                      role === "STUDENT"
                        ? "bg-blue-100 text-[#2062A3] dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold dark:text-slate-200">
                      {dictionary.auth.register.student}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      {dictionary.auth.register.student_desc}
                    </div>
                  </div>
                </div>

                {/* Teacher Card */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={role === "TEACHER"}
                  onClick={() => setRole("TEACHER")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRole("TEACHER");
                    }
                  }}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 text-center transition-all hover:border-[#2062A3] hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#2062A3] focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:focus-visible:ring-blue-500",
                    role === "TEACHER"
                      ? "border-[#2062A3] bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-700 dark:bg-slate-900"
                  )}
                >
                  {role === "TEACHER" && (
                    <div className="absolute top-2 right-2 text-[#2062A3] dark:text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-full p-3",
                      role === "TEACHER"
                        ? "bg-blue-100 text-[#2062A3] dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold dark:text-slate-200">
                      {dictionary.auth.register.teacher}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      {dictionary.auth.register.teacher_desc}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Label className="dark:text-slate-200" htmlFor="phone">
                {dictionary.auth.register.phone}
              </Label>
              <PhoneInput
                id="phone"
                value={phoneNumber}
                onChange={setPhoneNumber}
                searchPlaceholder={
                  dictionary.components.phone_input.search_country
                }
                noResultsMessage={
                  dictionary.components.phone_input.no_country_found
                }
              />
            </div>

            {/* Password Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-200" htmlFor="password">
                  {dictionary.auth.register.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder={dictionary.common.password_placeholder}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    aria-label={dictionary.common.toggle_password_visibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className="dark:text-slate-200"
                  htmlFor="confirm-password"
                >
                  {dictionary.auth.register.password_confirm}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    placeholder={dictionary.common.password_placeholder}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    aria-label={dictionary.common.toggle_password_visibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex flex-row items-center gap-3 space-y-0 rounded-xl border border-slate-200 p-3 shadow-sm transition-all duration-200 hover:border-[#2062A3]/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:bg-slate-900">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked as boolean)
                }
                className="h-5 w-5 border-2 border-slate-300 transition-all duration-200 data-[state=checked]:border-[#2062A3] data-[state=checked]:bg-[#2062A3] dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
              />
              <div className="flex-1 leading-none">
                <label
                  htmlFor="terms"
                  className="block cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {dictionary.legal.accept_terms
                    .split(/(\[.*?\])/g)
                    .map((part: string, i: number) => {
                      if (part.startsWith("[") && part.endsWith("]")) {
                        const content = part.slice(1, -1);
                        const href =
                          content === dictionary.legal.terms_title ||
                          content === "Terms of Service" ||
                          content === "Kullanıcı Sözleşmesi"
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
                </label>
              </div>
            </div>

            {/* Marketing Consent Checkbox */}
            <div className="flex flex-row items-center gap-3 space-y-0 rounded-xl border border-slate-200 p-3 shadow-sm transition-all duration-200 hover:border-[#2062A3]/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:bg-slate-900">
              <Checkbox
                id="marketingConsent"
                checked={marketingConsent}
                onCheckedChange={(checked) =>
                  setMarketingConsent(checked as boolean)
                }
                className="h-5 w-5 border-2 border-slate-300 transition-all duration-200 data-[state=checked]:border-[#2062A3] data-[state=checked]:bg-[#2062A3] dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
              />
              <div className="flex-1 leading-none">
                <label
                  htmlFor="marketingConsent"
                  className="block cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {dictionary.legal.marketing_consent}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="h-11 w-full bg-[#2062A3] text-base hover:bg-[#1a4f83] dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary.auth.onboarding.submitting}
                </>
              ) : (
                dictionary.auth.onboarding.submit
              )}
            </Button>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {dictionary.dashboard.nav.logout}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
