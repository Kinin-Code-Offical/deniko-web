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
import { updateNotificationPreferencesAction } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

const notificationsSchema = z.object({
  emailEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
});

interface NotificationsDictionary {
  title: string;
  description: string;
  email: { label: string; description: string };
  inApp: { label: string; description: string };
  save: string;
  success: string;
  saving: string;
}

interface NotificationsFormProps {
  initialData: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
  };
  dictionary: NotificationsDictionary;
  lang: string;
}

export function NotificationsForm({
  initialData,
  dictionary,
  lang,
}: NotificationsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: initialData,
  });

  function onSubmit(data: z.infer<typeof notificationsSchema>) {
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.success);
      }
    });
  }

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Bell className="text-primary h-5 w-5" />
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
            name="emailEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {dictionary.email.label}
                  </FormLabel>
                  <FormDescription>
                    {dictionary.email.description}
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
            name="inAppEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {dictionary.inApp.label}
                  </FormLabel>
                  <FormDescription>
                    {dictionary.inApp.description}
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
