import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Phone, Settings } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { generatePersonSchema } from "@/lib/json-ld";
import { env } from "@/lib/env";

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
      name: true,
      username: true,
      role: true,
      isProfilePublic: true,
      showAvatarOnProfile: true,
      image: true,
    },
  });

  if (!user) {
    return {
      title: dictionary.profile.public.notFound,
      robots: { index: false, follow: false },
    };
  }

  const globalNoIndex = env.NEXT_PUBLIC_NOINDEX;
  const indexable = user.isProfilePublic && !globalNoIndex;

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
    const { getSignedUrl } = await import("@/lib/storage");
    imageUrl = await getSignedUrl(imageUrl);
  }

  const ogImageUrl =
    user.showAvatarOnProfile && imageUrl
      ? imageUrl
      : "https://deniko.net/og-image.png"; // Generic image

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
    },
  });

  if (!user) {
    notFound();
  }

  const viewerId = session?.user?.id;
  const isOwner = viewerId === user.id;

  // Privacy Check: Profile Visibility
  if (!user.isProfilePublic && !isOwner) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-lg">
              {dictionary.seo.profile.private}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabel =
    user.role === "TEACHER"
      ? dictionary.profile.public.role_teacher
      : user.role === "STUDENT"
        ? dictionary.profile.public.role_student
        : "";

  // Determine visibility of specific fields
  const showAvatar = isOwner || user.showAvatarOnProfile;
  const showEmail = isOwner || user.showEmailOnProfile;
  const showPhone = isOwner || user.showPhoneOnProfile;
  const allowMessages = isOwner || user.allowMessagesFromUsers;

  let imageUrl = user.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    const { getSignedUrl } = await import("@/lib/storage");
    imageUrl = await getSignedUrl(imageUrl);
  }

  // JSON-LD
  const globalNoIndex = env.NEXT_PUBLIC_NOINDEX;
  const indexable = user.isProfilePublic && !globalNoIndex;
  const jsonLd =
    indexable && user.isProfilePublic
      ? generatePersonSchema(
          user.name || "",
          `https://deniko.net/${lang}/users/${username}`,
          showAvatar ? imageUrl : null
        )
      : null;

  return (
    <div className="container mx-auto max-w-4xl py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Card className="overflow-hidden">
        <div className="h-32 bg-slate-100 sm:h-48 dark:bg-slate-800" />
        <CardHeader className="relative pb-0">
          <div className="absolute -top-16 left-6 sm:-top-20 sm:left-10">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg sm:h-40 sm:w-40 dark:border-slate-950">
              {showAvatar ? (
                <AvatarImage src={imageUrl || ""} alt={user.name || ""} />
              ) : null}
              <AvatarFallback className="text-4xl">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-16 flex flex-col gap-4 sm:mt-20 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                @{user.username}
              </p>
              {roleLabel && (
                <Badge variant="secondary" className="mt-2">
                  {roleLabel}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {!isOwner && (
                <>
                  {allowMessages ? (
                    <Button asChild>
                      <Link
                        href={`/${lang}/dashboard/messages?to=${user.username}`}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {dictionary.profile.public.messageButton}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      {dictionary.profile.settings.privacy.messagingDisabled}
                    </Button>
                  )}
                </>
              )}
              {isOwner && (
                <Button asChild variant="outline">
                  <Link href={`/${lang}/dashboard/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    {dictionary.dashboard.header.settings}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {showEmail && user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            {showPhone && user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
