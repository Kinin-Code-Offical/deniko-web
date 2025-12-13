import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { db } from "@/lib/db";
import { ProfileSummaryCard } from "@/components/dashboard/profile/profile-summary-card";
import { PrivacyPreferencesCard } from "@/components/dashboard/profile/privacy-preferences-card";
import { ActivityStatsCard } from "@/components/dashboard/profile/activity-stats-card";
import { NotificationsPermissionsCard } from "@/components/dashboard/profile/notifications-permissions-card";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      settings: true,
      teacherProfile: {
        include: {
          _count: {
            select: { lessons: true, studentRelations: true },
          },
        },
      },
      studentProfile: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const lessonsCount =
    (user.teacherProfile?._count.lessons || 0) +
    (user.studentProfile?._count.lessons || 0);
  const studentsCount = user.teacherProfile?._count.studentRelations || 0;

  // Mock stats for now
  const stats = {
    lessons: lessonsCount,
    students: studentsCount,
    hours: 0,
    rating: "-",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.profile.title}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <ProfileSummaryCard user={user} dictionary={dictionary} lang={lang} />
          <PrivacyPreferencesCard
            settings={user.settings}
            dictionary={dictionary}
            lang={lang}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ActivityStatsCard stats={stats} dictionary={dictionary} />
          <NotificationsPermissionsCard
            user={user}
            dictionary={dictionary}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
