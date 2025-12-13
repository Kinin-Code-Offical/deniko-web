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
import { Separator } from "@/components/ui/separator";

import { updateProfilePrivacyAction } from "@/app/actions/privacy";

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "private"]),
  showAvatar: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowMessages: z.boolean(),
  showCourses: z.boolean(),
});

type PrivacyFormValues = z.infer<typeof privacySchema>;

import type { UserSettings } from "@prisma/client";
import type { Dictionary } from "@/types/i18n";

interface PrivacyPreferencesCardProps {
  settings: UserSettings | null | undefined;
  dictionary: Dictionary;
  lang: string;
}

export function PrivacyPreferencesCard({
  settings,
  dictionary,
  lang,
}: PrivacyPreferencesCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility:
        (settings?.profileVisibility as "public" | "private") || "public",
      showAvatar: settings?.showAvatar ?? true,
      showEmail: settings?.showEmail ?? false,
      showPhone: settings?.showPhone ?? false,
      allowMessages: settings?.allowMessages ?? true,
      showCourses: settings?.showCourses ?? true,
    },
  });

  async function onSubmit(data: PrivacyFormValues) {
    setIsPending(true);
    try {
      const result = await updateProfilePrivacyAction(data, lang);
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

  // Auto-submit on change
  const handleSwitchChange = (
    field: ControllerRenderProps<
      PrivacyFormValues,
      "showAvatar" | "showEmail" | "showPhone" | "allowMessages" | "showCourses"
    >,
    value: boolean
  ) => {
    field.onChange(value);
    form.handleSubmit(onSubmit)();
  };

  const handleVisibilityChange = (value: string) => {
    form.setValue("profileVisibility", value as "public" | "private");
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.settings.privacy.title}</CardTitle>
        <CardDescription>
          {dictionary.dashboard.settings.privacy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-muted-foreground text-sm font-medium">
                {dictionary.dashboard.settings.privacy.visibility_title}
              </h4>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {dictionary.dashboard.settings.privacy.public_profile}
                  </FormLabel>
                  <FormDescription>
                    {dictionary.dashboard.settings.privacy.public_profile_desc}
                  </FormDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={
                      form.watch("profileVisibility") === "public"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleVisibilityChange("public")}
                    disabled={isPending}
                  >
                    {dictionary.dashboard.settings.privacy.public}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      form.watch("profileVisibility") === "private"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleVisibilityChange("private")}
                    disabled={isPending}
                  >
                    {dictionary.dashboard.settings.privacy.private}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-muted-foreground text-sm font-medium">
                {dictionary.dashboard.settings.privacy.display_options}
              </h4>

              <FormField
                control={form.control}
                name="showAvatar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {dictionary.dashboard.settings.privacy.show_avatar}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) =>
                          handleSwitchChange(field, val)
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {dictionary.dashboard.settings.privacy.show_email}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) =>
                          handleSwitchChange(field, val)
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {dictionary.dashboard.settings.privacy.show_phone}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) =>
                          handleSwitchChange(field, val)
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-muted-foreground text-sm font-medium">
                {dictionary.dashboard.settings.privacy.interactions}
              </h4>

              <FormField
                control={form.control}
                name="allowMessages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {dictionary.dashboard.settings.privacy.allow_messages}
                      </FormLabel>
                      <FormDescription>
                        {
                          dictionary.dashboard.settings.privacy
                            .allow_messages_desc
                        }
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) =>
                          handleSwitchChange(field, val)
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
