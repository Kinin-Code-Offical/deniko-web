"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { updateProfileBasicAction } from "@/app/actions/settings";
import { getAvatarUrl } from "@/lib/utils";
import { AvatarUploadDialog } from "@/components/dashboard/settings/avatar-upload-dialog";

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  username: z.string().min(3).max(30),
  bio: z.string().optional(),
  preferredCountry: z.string().optional(),
  preferredTimezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

import type { UserWithProfile } from "@/types/user";
import type { Dictionary } from "@/types/i18n";

interface ProfileSummaryCardProps {
  user: UserWithProfile;
  dictionary: Dictionary;
  lang: string;
}

export function ProfileSummaryCard({
  user,
  dictionary,
  lang,
}: ProfileSummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      bio: user.teacherProfile?.bio || "",
      preferredCountry: user.preferredCountry || "",
      preferredTimezone: user.preferredTimezone || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ProfileFormValues) {
    try {
      const result = await updateProfileBasicAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.common.success);
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      toast.error(dictionary.common.error);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{dictionary.dashboard.profile.personal_info}</CardTitle>
          <CardDescription>
            {dictionary.dashboard.profile.personal_info_desc}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? dictionary.common.cancel : dictionary.common.edit}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-6">
          <div className="group relative">
            <Avatar className="h-24 w-24 border-4 border-slate-100 dark:border-slate-800">
              <AvatarImage src={getAvatarUrl(user.image, user.id)} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <AvatarUploadDialog
              currentAvatarUrl={getAvatarUrl(user.image, user.id)}
              onAvatarUpdate={() => router.refresh()}
              dictionary={dictionary}
              lang={lang}
            >
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </AvatarUploadDialog>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.auth.register.first_name}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>
                        {dictionary.auth.register.last_name}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.auth.register.username}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {user.role === "TEACHER" && (
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.dashboard.profile.bio}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {dictionary.common.save}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid gap-4 text-sm">
            <div className="grid grid-cols-3 gap-4 border-t py-3">
              <span className="text-muted-foreground font-medium">
                {dictionary.auth.register.username}
              </span>
              <span className="col-span-2">@{user.username}</span>
            </div>
            {user.teacherProfile?.bio && (
              <div className="grid grid-cols-3 gap-4 border-t py-3">
                <span className="text-muted-foreground font-medium">
                  {dictionary.dashboard.profile.bio}
                </span>
                <span className="col-span-2">{user.teacherProfile.bio}</span>
              </div>
            )}
            {user.preferredCountry && (
              <div className="grid grid-cols-3 gap-4 border-t py-3">
                <span className="text-muted-foreground font-medium">
                  {dictionary.dashboard.settings.region.country.label}
                </span>
                <span className="col-span-2">{user.preferredCountry}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
