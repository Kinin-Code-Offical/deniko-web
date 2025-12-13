import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { PrivacySettings } from "@/components/dashboard/settings/privacy-settings";
import { SecurityForm } from "@/components/dashboard/settings/security-form";
import { DangerZone } from "@/components/dashboard/settings/danger-zone";
import { SettingsSidebar } from "@/components/dashboard/settings/settings-sidebar";
import { NotificationsForm } from "@/components/dashboard/settings/notifications-form";
import { RegionForm } from "@/components/dashboard/settings/region-form";
import { CookiesForm } from "@/components/dashboard/settings/cookies-form";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getDefaultAvatarsAction } from "@/app/actions/settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      image: true,
      avatarVersion: true,
      role: true,
      settings: true,
      notificationEmailEnabled: true,
      notificationInAppEnabled: true,
      preferredCountry: true,
      preferredTimezone: true,
      cookieAnalyticsEnabled: true,
      isMarketingConsent: true,
      teacherProfile: {
        select: {
          branch: true,
          bio: true,
        },
      },
      studentProfile: {
        select: {
          studentNo: true,
          gradeLevel: true,
          parentName: true,
          parentPhone: true,
          parentEmail: true,
        },
      },
    },
  });

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const imageUrl = user.image;

  const defaultAvatars = await getDefaultAvatarsAction();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          {dictionary.dashboard.settings.title}
        </h2>
        <p className="text-muted-foreground">
          {dictionary.dashboard.settings.description}
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <Tabs
          defaultValue="profile"
          className="flex w-full flex-col lg:flex-row lg:space-x-12"
          orientation="vertical"
        >
          <SettingsSidebar
            dictionary={dictionary.dashboard.settings}
            className="lg:w-1/5"
          />
          <div className="flex-1 lg:max-w-2xl">
            <TabsContent value="profile" className="mt-0 space-y-6">
              <ProfileForm
                initialData={{
                  id: user.id,
                  username: user.username || "",
                  firstName: user.firstName || "",
                  lastName: user.lastName || "",
                  image: imageUrl,
                  avatarVersion: user.avatarVersion,
                  phoneNumber: user.phoneNumber,
                  role: user.role || "STUDENT",
                  teacherProfile: user.teacherProfile,
                  studentProfile: user.studentProfile,
                }}
                dictionary={{
                  ...dictionary.profile.settings.basic,
                  username: dictionary.profile.settings.username,
                  validation: dictionary.validation,
                  files: dictionary.dashboard.files,
                }}
                lang={lang}
                defaultAvatars={defaultAvatars}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <SecurityForm
                userEmail={user.email || ""}
                dictionary={dictionary.profile.settings.security}
                lang={lang}
              />
              <DangerZone
                dictionary={dictionary.profile.settings.danger}
                lang={lang}
              />
            </TabsContent>

            <TabsContent value="privacy" className="mt-0 space-y-6">
              <PrivacySettings
                initialData={{
                  profileVisibility:
                    user.settings?.profileVisibility ?? "public",
                  showAvatar: user.settings?.showAvatar ?? true,
                  showEmail: user.settings?.showEmail ?? false,
                  showPhone: user.settings?.showPhone ?? false,
                  allowMessages: user.settings?.allowMessages ?? true,
                  showCourses: user.settings?.showCourses ?? true,
                }}
                dictionary={dictionary.profile.settings.privacy}
                lang={lang}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <NotificationsForm
                initialData={{
                  emailEnabled: user.notificationEmailEnabled,
                  inAppEnabled: user.notificationInAppEnabled,
                }}
                dictionary={dictionary.profile.settings.notifications}
                lang={lang}
              />
            </TabsContent>

            <TabsContent value="language" className="mt-0 space-y-6">
              <RegionForm
                initialData={{
                  country: user.preferredCountry || "TR",
                  timezone: user.preferredTimezone || "Europe/Istanbul",
                }}
                dictionary={dictionary.profile.settings.region}
                lang={lang}
              />
            </TabsContent>

            <TabsContent value="cookies" className="mt-0 space-y-6">
              <CookiesForm
                initialData={{
                  analyticsEnabled: user.cookieAnalyticsEnabled,
                  marketingEnabled: user.isMarketingConsent,
                }}
                dictionary={dictionary.profile.settings.cookies}
                lang={lang}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
