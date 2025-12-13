"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { updateProfilePrivacyAction } from "@/app/actions/privacy";
import { toast } from "sonner";
import { Loader2, Lock, Globe } from "lucide-react";

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "private"]),
  showAvatar: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowMessages: z.boolean(),
  showCourses: z.boolean(),
});

interface PrivacyDictionary {
  title: string;
  description: string;
  profileVisibility: {
    label: string;
    public: string;
    private: string;
  };
  showAvatar: { label: string };
  showEmail: { label: string };
  showPhone: { label: string };
  allowMessages: { label: string };
  showCourses: { label: string };
  save: string;
  success: string;
  saving: string;
}

interface PrivacySettingsProps {
  initialData: {
    profileVisibility: string;
    showAvatar: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    showCourses: boolean;
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
      profileVisibility: initialData.profileVisibility as "public" | "private",
      showAvatar: initialData.showAvatar,
      showEmail: initialData.showEmail,
      showPhone: initialData.showPhone,
      allowMessages: initialData.allowMessages,
      showCourses: initialData.showCourses,
    },
  });

  const profileVisibility = useWatch({
    control: form.control,
    name: "profileVisibility",
  });

  function onSubmit(data: z.infer<typeof privacySchema>) {
    startTransition(async () => {
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
          {profileVisibility === "public" ? (
            <Globe className="text-primary h-5 w-5" />
          ) : (
            <Lock className="text-muted-foreground h-5 w-5" />
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
            name="profileVisibility"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{dictionary.profileVisibility.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-y-0 space-x-3">
                      <FormControl>
                        <RadioGroupItem value="public" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {dictionary.profileVisibility.public}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-y-0 space-x-3">
                      <FormControl>
                        <RadioGroupItem value="private" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {dictionary.profileVisibility.private}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="border-muted space-y-4 border-l-2 pl-4">
            <FormField
              control={form.control}
              name="showAvatar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showAvatar.label}</FormLabel>
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
              name="showEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showEmail.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || profileVisibility === "private"}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showPhone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showPhone.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || profileVisibility === "private"}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowMessages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.allowMessages.label}</FormLabel>
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
              name="showCourses"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{dictionary.showCourses.label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || profileVisibility === "private"}
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
