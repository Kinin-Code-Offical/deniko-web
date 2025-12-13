"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, BookOpen, MapPin, Clock, Settings } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/types/i18n";
import { getAvatarUrl } from "@/lib/utils";

interface UserProfileHeroProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    role: "TEACHER" | "STUDENT" | "ADMIN" | null;
    country?: string | null;
    timezone?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  stats?: {
    lessons: number;
    students: number;
    rating: number | string;
  };
  dictionary: Dictionary;
  lang: string;
  isOwner: boolean;
  canMessage: boolean;
  canBookLesson: boolean;
}

export function UserProfileHero({
  user,
  stats = { lessons: 0, students: 0, rating: "-" },
  dictionary,
  lang,
  isOwner,
  canMessage,
  canBookLesson,
}: UserProfileHeroProps) {
  const roleLabel =
    user.role === "TEACHER"
      ? dictionary.profile.public.role_teacher
      : user.role === "STUDENT"
        ? dictionary.profile.public.role_student
        : "";

  return (
    <Card className="border-border bg-card space-y-6 rounded-2xl border p-4 shadow-sm sm:p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-4">
          <div className="border-border h-20 w-20 shrink-0 overflow-hidden rounded-full border sm:h-24 sm:w-24">
            <Avatar className="h-full w-full">
              <AvatarImage
                src={getAvatarUrl(user.image, user.id)}
                alt={user.name || ""}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-1">
            <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              {user.name}
            </h1>
            <p className="text-muted-foreground text-sm">@{user.username}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {roleLabel && (
                <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {roleLabel}
                </span>
              )}
              {user.country && (
                <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span>{user.country}</span>
                </span>
              )}
              {user.timezone && (
                <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{user.timezone}</span>
                </span>
              )}
            </div>

            <div className="text-muted-foreground flex flex-col gap-1 pt-2 text-sm">
              {user.email && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {dictionary.dashboard.profile.email}:
                  </span>
                  <a href={`mailto:${user.email}`} className="hover:underline">
                    {user.email}
                  </a>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {dictionary.dashboard.profile.phone}:
                  </span>
                  <a href={`tel:${user.phone}`} className="hover:underline">
                    {user.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Stats + Actions */}
        <div className="flex w-full flex-col items-start gap-4 md:w-auto md:items-end">
          <div className="grid w-full grid-cols-3 gap-3 text-center md:w-auto">
            <Stat
              label={dictionary.profile.public.stats.lessons}
              value={stats.lessons}
            />
            <Stat
              label={dictionary.profile.public.stats.students}
              value={stats.students}
            />
            <Stat
              label={dictionary.profile.public.stats.rating}
              value={stats.rating}
            />
          </div>
          <div className="flex w-full flex-wrap justify-start gap-2 md:w-auto md:justify-end">
            {!isOwner && (
              <>
                {canMessage && (
                  <Button asChild size="sm">
                    <Link
                      href={`/${lang}/dashboard/messages?to=${user.username}`}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {dictionary.profile.public.actions.sendMessage}
                    </Link>
                  </Button>
                )}
                {canBookLesson && (
                  <Button size="sm" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {dictionary.profile.public.actions.requestLesson}
                  </Button>
                )}
              </>
            )}
            {isOwner && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/${lang}/dashboard/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  {dictionary.dashboard.header.settings}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-muted/40 border-border min-w-20 rounded-xl border px-3 py-2">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-foreground text-base font-semibold">{value}</div>
    </div>
  );
}
