"use client";

import { useTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import {
  changePasswordAction,
  requestEmailChangeAction,
} from "@/app/actions/settings";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordDictionary {
  title: string;
  description: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  placeholder: string;
  save: string;
  success: string;
  security_strength: string;
  saving: string;
  hide_password: string;
  show_password: string;
  enter_password: string;
  weak: string;
  medium: string;
  strong: string;
  validation: {
    required: string;
    min_length: string;
    passwords_do_not_match: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
  };
}

interface EmailDictionary {
  title: string;
  description: string;
  currentEmail: string;
  newEmail: string;
  sendVerification: string;
  success: string;
  sending: string;
  placeholder: string;
}

interface SecurityDictionary {
  password: PasswordDictionary;
  email: EmailDictionary;
  validation?: {
    required: string;
    min_length: string;
    passwords_do_not_match: string;
  };
}

interface SecurityFormProps {
  userEmail: string;
  dictionary: SecurityDictionary;
  lang: string;
}

export function SecurityForm({
  userEmail,
  dictionary,
  lang,
}: SecurityFormProps) {
  return (
    <div className="space-y-6">
      <PasswordChangeForm dictionary={dictionary.password} lang={lang} />
      <EmailChangeForm
        currentEmail={userEmail}
        dictionary={dictionary.email}
        lang={lang}
      />
    </div>
  );
}

function PasswordChangeForm({
  dictionary,
  lang,
}: {
  dictionary: PasswordDictionary;
  lang: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          dictionary.currentPassword + " " + dictionary.validation.required
        ),
      newPassword: z
        .string()
        .min(
          8,
          dictionary.newPassword +
            " " +
            dictionary.validation.min_length.replace("{length}", "8")
        )
        .regex(/[A-Z]/, dictionary.validation.uppercase)
        .regex(/[a-z]/, dictionary.validation.lowercase)
        .regex(/[0-9]/, dictionary.validation.number)
        .regex(/[!@#$%^&*(),.?":{}|<>]/, dictionary.validation.special),
      confirmPassword: z
        .string()
        .min(
          1,
          dictionary.confirmPassword + " " + dictionary.validation.required
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: dictionary.validation.passwords_do_not_match,
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange", // ignore-hardcoded
  });

  const newPasswordValue = useWatch({
    control: form.control,
    name: "newPassword",
  });

  const requirements = [
    {
      regex: /.{8,}/,
      label: dictionary.validation.min_length.replace("{length}", "8"),
    },
    { regex: /[A-Z]/, label: dictionary.validation.uppercase },
    { regex: /[a-z]/, label: dictionary.validation.lowercase },
    { regex: /[0-9]/, label: dictionary.validation.number },
    { regex: /[^A-Za-z0-9]/, label: dictionary.validation.special },
  ];

  const strength = requirements.reduce((acc, req) => {
    if (req.regex.test(newPasswordValue || "")) return acc + 1;
    return acc;
  }, 0);

  const getStrengthLabel = (score: number) => {
    if (score === 0) return dictionary.enter_password;
    if (score <= 2) return dictionary.weak;
    if (score <= 4) return dictionary.medium;
    return dictionary.strong;
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-muted";
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score <= 2) return "text-red-500";
    if (score <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  function onSubmit(data: z.infer<typeof passwordSchema>) {
    startTransition(async () => {
      const result = await changePasswordAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.success);
        form.reset();
      }
    });
  }

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Lock className="text-primary h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.currentPassword}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      {...field}
                      disabled={isPending}
                      className="pr-10 pl-9"
                      placeholder={dictionary.placeholder}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={isPending}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Eye className="text-muted-foreground h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showCurrentPassword
                          ? dictionary.hide_password
                          : dictionary.show_password}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.newPassword}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                        disabled={isPending}
                        className="pr-10 pl-9"
                        placeholder={dictionary.placeholder}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isPending}
                      >
                        {showNewPassword ? (
                          <EyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Eye className="text-muted-foreground h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showNewPassword
                            ? dictionary.hide_password
                            : dictionary.show_password}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  {/* Password Strength Meter */}
                  <div className="border-border/50 bg-muted/30 mt-4 rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium">
                        {dictionary.security_strength}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold transition-colors duration-300",
                          getStrengthTextColor(strength)
                        )}
                      >
                        {getStrengthLabel(strength)}
                      </span>
                    </div>
                    <div className="bg-secondary/20 flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-full w-full transition-all duration-500",
                            i < strength
                              ? getStrengthColor(strength)
                              : "bg-transparent"
                          )}
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {requirements.map((req, i) => {
                        const isMet = req.regex.test(newPasswordValue || "");
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-300",
                              isMet
                                ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-background text-muted-foreground border-transparent"
                            )}
                          >
                            {isMet ? (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <div className="border-muted-foreground/30 h-3.5 w-3.5 shrink-0 rounded-full border" />
                            )}
                            <span className="font-medium">{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.confirmPassword}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ShieldCheck className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        disabled={isPending}
                        className="pr-10 pl-9"
                        placeholder={dictionary.placeholder}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Eye className="text-muted-foreground h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
                            ? dictionary.hide_password
                            : dictionary.show_password}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-w-40 transition-all duration-200 md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary.saving}
                </>
              ) : (
                dictionary.save
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function EmailChangeForm({
  currentEmail,
  dictionary,
  lang,
}: {
  currentEmail: string;
  dictionary: EmailDictionary;
  lang: string;
}) {
  const [isPending, startTransition] = useTransition();

  const emailSchema = z.object({
    newEmail: z.string().email(dictionary.newEmail + " invalid"),
  });

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  function onSubmit(data: z.infer<typeof emailSchema>) {
    startTransition(async () => {
      const result = await requestEmailChangeAction(data.newEmail, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.success);
        form.reset();
      }
    });
  }

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Mail className="text-primary h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <div className="text-muted-foreground bg-muted/50 border-border rounded-lg border p-3 text-sm">
        {dictionary.currentEmail}:{" "}
        <span className="text-foreground font-medium">{currentEmail}</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.newEmail}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type="email"
                      {...field}
                      disabled={isPending}
                      className="pl-9"
                      placeholder={dictionary.placeholder}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-w-40 transition-all duration-200 md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary.sending}
                </>
              ) : (
                dictionary.sendVerification
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
