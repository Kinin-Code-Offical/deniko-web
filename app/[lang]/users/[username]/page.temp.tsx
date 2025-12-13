import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { generatePersonSchema } from "@/lib/json-ld";
import { env } from "@/lib/env";
import { UserProfileHero } from "@/components/users/user-profile-hero";
import { UserProfileTabs } from "@/components/users/user-profile-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface UserProfilePageProps {
  params: Promise<{
    lang: Locale;
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { lang, username } = await params;
  const dictionary = await getDictionary(lang);

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      image: true,
      settings: {
        select: {
          profileVisibility: true,
          showAvatar: true,
        },
      },
    },
  });

  if (!user) {
    return {
      title: dictionary.profile.public.notFound,
      robots: { index: false, follow: false },
    };
  }

  const globalNoIndex = env.NEXT_PUBLIC_NOINDEX;
  const profileVisibility = user.settings?.profileVisibility ?? "public";
  const showAvatar = user.settings?.showAvatar ?? true;
  const indexable = profileVisibility === "public" && !globalNoIndex;

  const title = dictionary.seo.profile.title.replace("{name}", user.name || "");

  let description = dictionary.seo.profile.description.generic.replace(
    "{name}",
    user.name || ""
  );

  if (user.role === "TEACHER") {
    description = dictionary.seo.profile.description.teacher.replace(
      "{name}",
      user.name || ""
    );
  } else if (user.role === "STUDENT") {
    description = dictionary.seo.profile.description.student.replace(
      "{name}",
      user.name || ""
    );
  }

  const url = `https://deniko.net/${lang}/users/${username}`;

  let imageUrl = user.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    // Use API URL for internal images
    imageUrl = `${env.NEXT_PUBLIC_SITE_URL || "https://deniko.net"}/api/avatar/${user.id}`;
  }

  const ogImageUrl =
    showAvatar && imageUrl ? imageUrl : "https://deniko.net/og-image.png"; // Generic image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: user.name || "Deniko User",
        },
      ],
    },
    alternates: {
      canonical: url,
      languages: {
        tr: `https://deniko.net/tr/users/${username}`,
        en: `https://deniko.net/en/users/${username}`,
      },
    },
    robots: {
      index: indexable,
      follow: indexable,
      nocache: !indexable,
    },
  };
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { lang, username } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();

  const user = await db.user.findUnique({
    where: { username },
    include: {
      teacherProfile: true,
      studentProfile: true,
      settings: true,
    },
  });

  if (!user) {
    notFound();
  }

  const viewerId = session?.user?.id;
  const isOwner = viewerId === user.id;

  const { settings } = user;
  const profileVisibility = settings?.profileVisibility ?? "public";
  const isPrivate = profileVisibility === "private" && !isOwner;

  // Determine visibility of specific fields
  // Avatar is shown if:
  // 1. Viewer is owner
  // 2. OR (Profile is public AND Avatar is enabled on profile)
  const showAvatar =
    isOwner ||
    (profileVisibility === "public" && (settings?.showAvatar ?? true));
  const allowMessages = isOwner || (settings?.allowMessages ?? true);

  let imageUrl = user.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    // Use API URL for internal images
    imageUrl = `${env.NEXT_PUBLIC_SITE_URL || "https://deniko.net"}/api/avatar/${user.id}`;
  }

  // JSON-LD
  const globalNoIndex = env.NEXT_PUBLIC_NOINDEX;
  const indexable = profileVisibility === "public" && !globalNoIndex;
  const jsonLd = indexable
    ? generatePersonSchema(
        user.name || "",
        `https://deniko.net/${lang}/users/${username}`,
        showAvatar ? imageUrl : null
      )
    : null;

  // Prepare data for components
  const bio = user.teacherProfile?.bio || null;
  const subjects = user.teacherProfile?.branch
    ? [user.teacherProfile.branch]
    : [];
  const levels = user.studentProfile?.gradeLevel
    ? [user.studentProfile.gradeLevel]
    : [];

  // Mock stats for now (as requested to make it look full)
  const stats = {
    lessons: 0,
    students: 0,
    rating: "-",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <UserProfileHero
        user={{
          id: user.id,
          name: user.name,
          username: user.username,
          image: showAvatar ? imageUrl : null,
          role: user.role,
          country: user.preferredCountry,
          timezone: user.preferredTimezone,
        }}
        stats={stats}
        dictionary={dictionary}
        lang={lang}
        isOwner={isOwner}
        canMessage={!isPrivate && allowMessages}
        canBookLesson={!isPrivate && user.role === "TEACHER"}
      />

      {isPrivate ? (
        <Alert
          variant="default"
          className="border-dashed border-yellow-500/50 bg-yellow-500/10"
        >
          <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">
            {dictionary.profile.public.private.title}
          </AlertTitle>
          <AlertDescription className="text-yellow-700/90 dark:text-yellow-400/90">
            {dictionary.profile.public.private.description}
          </AlertDescription>
        </Alert>
      ) : (
        <UserProfileTabs
          dictionary={dictionary}
          bio={bio}
          subjects={subjects}
          levels={levels}
          // Mock data for empty states
          lessons={[]}
          reviews={[]}
        />
      )}
    </div>
  );
}
