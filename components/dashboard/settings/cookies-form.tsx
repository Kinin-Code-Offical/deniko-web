"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { updateCookiePreferencesAction } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, ExternalLink, Cookie } from "lucide-react";
import Link from "next/link";

const cookiesSchema = z.object({
  analyticsEnabled: z.boolean(),
  marketingEnabled: z.boolean(),
});

interface CookiesDictionary {
  title: string;
  description: string;
  necessary: { label: string; description: string };
  analytics: { label: string; description: string };
  marketing: { label: string; description: string };
  links: { privacy: string; cookies: string };
  save: string;
  success: string;
  saving: string;
}

interface CookiesFormProps {
  initialData: {
    analyticsEnabled: boolean;
    marketingEnabled: boolean;
  };
  dictionary: CookiesDictionary;
  lang: string;
}

export function CookiesForm({
  initialData,
  dictionary,
  lang,
}: CookiesFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof cookiesSchema>>({
    resolver: zodResolver(cookiesSchema),
    defaultValues: initialData,
  });

  function onSubmit(data: z.infer<typeof cookiesSchema>) {
    startTransition(async () => {
      const result = await updateCookiePreferencesAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.success);
        // Update browser cookies logic here if needed, or rely on server action setting headers/cookies
        // But usually we need to trigger a client-side update for analytics scripts
        // For now, we assume the server action handles the persistence and maybe we reload or update context
      }
    });
  }

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Cookie className="text-primary h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <div className="text-muted-foreground flex flex-col space-y-2 text-sm">
        <div className="flex gap-4">
          <Link
            href={`/${lang}/legal/privacy`}
            className="flex items-center hover:underline"
          >
            {dictionary.links.privacy} <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
          <Link
            href={`/${lang}/legal/cookies`}
            className="flex items-center hover:underline"
          >
            {dictionary.links.cookies} <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Strictly Necessary - Always On */}
            <div className="bg-muted/50 flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {dictionary.necessary.label}
                </FormLabel>
                <FormDescription>
                  {dictionary.necessary.description}
                </FormDescription>
              </div>
              <Switch checked={true} disabled={true} />
            </div>

            <FormField
              control={form.control}
              name="analyticsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {dictionary.analytics.label}
                    </FormLabel>
                    <FormDescription>
                      {dictionary.analytics.description}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marketingEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {dictionary.marketing.label}
                    </FormLabel>
                    <FormDescription>
                      {dictionary.marketing.description}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
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
