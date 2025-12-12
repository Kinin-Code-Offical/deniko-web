"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { updateProfilePrivacyAction } from "@/app/actions/privacy";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const privacySchema = z.object({
  isProfilePublic: z.boolean(),
  showEmailOnProfile: z.boolean(),
  showCoursesOnProfile: z.boolean(),
  showAchievementsOnProfile: z.boolean(),
});

interface PrivacyDictionary {
  title: string;
  description: string;
  isProfilePublic: { label: string; description: string };
  showEmail: { label: string };
  showCourses: { label: string };
  showAchievements: { label: string };
  save: string;
  success: string;
  saving: string;
}

interface PrivacySettingsProps {
  initialData: {
    isProfilePublic: boolean;
    showEmailOnProfile: boolean;
    showCoursesOnProfile: boolean;
    showAchievementsOnProfile: boolean;
  };
  dictionary: PrivacyDictionary;
  lang: string;
}

export function PrivacySettings({
  initialData,
  dictionary,
  lang,
}: PrivacySettingsProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      isProfilePublic: initialData.isProfilePublic,
      showEmailOnProfile: initialData.showEmailOnProfile,
      showCoursesOnProfile: initialData.showCoursesOnProfile,
      showAchievementsOnProfile: initialData.showAchievementsOnProfile,
    },
  });

  const isProfilePublic = useWatch({
    control: form.control,
    name: "isProfilePublic",
  });

  function onSubmit(data: z.infer<typeof privacySchema>) {
    startTransition(async () => {
      // We reuse updateProfileBasicAction as it handles partial updates
      const result = await updateProfilePrivacyAction(data, lang);
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
          {isProfilePublic ? (
            <Eye className="text-primary h-5 w-5" />
          ) : (
            <EyeOff className="text-muted-foreground h-5 w-5" />
          )}
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
            name="isProfilePublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {dictionary.isProfilePublic.label}
                  </FormLabel>
                  <FormDescription>
                    {dictionary.isProfilePublic.description}
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

          <div className="border-muted space-y-4 border-l-2 pl-4">
            <FormField
              control={form.control}
              name="showEmailOnProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showEmail.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || !isProfilePublic}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showCoursesOnProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showCourses.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || !isProfilePublic}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showAchievementsOnProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showAchievements.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || !isProfilePublic}
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
