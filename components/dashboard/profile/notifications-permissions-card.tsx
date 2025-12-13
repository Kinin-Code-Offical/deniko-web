"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

// We'll need a new action for this, or reuse updateProfileBasicAction if we add these fields to it.
// For now, I'll assume we might need to add these to the update action or create a new one.
// Since the schema has these on User model, we can update them.

import { updateProfileBasicAction } from "@/app/actions/settings";

const notificationsSchema = z.object({
  notificationEmailEnabled: z.boolean(),
  notificationInAppEnabled: z.boolean(),
  isMarketingConsent: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsSchema>;

import type { User } from "@prisma/client";
import type { Dictionary } from "@/types/i18n";

interface NotificationsPermissionsCardProps {
  user: User;
  dictionary: Dictionary;
  lang: string;
}

export function NotificationsPermissionsCard({
  user,
  dictionary,
  lang,
}: NotificationsPermissionsCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      notificationEmailEnabled: user.notificationEmailEnabled ?? true,
      notificationInAppEnabled: user.notificationInAppEnabled ?? true,
      isMarketingConsent: user.isMarketingConsent ?? false,
    },
  });

  async function onSubmit(data: NotificationsFormValues) {
    setIsPending(true);
    try {
      // We need to make sure updateProfileBasicAction handles these fields.
      // I will update the action later to include these.
      const result = await updateProfileBasicAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.common.success);
        router.refresh();
      }
    } catch {
      toast.error(dictionary.common.error);
    } finally {
      setIsPending(false);
    }
  }

  const handleSwitchChange = (
    field: ControllerRenderProps<
      NotificationsFormValues,
      keyof NotificationsFormValues
    >,
    value: boolean
  ) => {
    field.onChange(value);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {dictionary.dashboard.settings.notifications.title}
        </CardTitle>
        <CardDescription>
          {dictionary.dashboard.settings.notifications.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="notificationEmailEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {dictionary.dashboard.settings.notifications.email.label}
                    </FormLabel>
                    <FormDescription>
                      {
                        dictionary.dashboard.settings.notifications.email
                          .description
                      }
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => handleSwitchChange(field, val)}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notificationInAppEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {dictionary.dashboard.settings.notifications.inApp.label}
                    </FormLabel>
                    <FormDescription>
                      {
                        dictionary.dashboard.settings.notifications.inApp
                          .description
                      }
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => handleSwitchChange(field, val)}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isMarketingConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {
                        dictionary.dashboard.settings.notifications.marketing
                          .label
                      }
                    </FormLabel>
                    <FormDescription>
                      {
                        dictionary.dashboard.settings.notifications.marketing
                          .description
                      }
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => handleSwitchChange(field, val)}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
