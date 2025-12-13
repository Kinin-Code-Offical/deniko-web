"use client";

import { getAvatarUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, ShieldAlert, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteButton } from "./invite-button";
import Link from "next/link";
import type { Dictionary } from "@/types/i18n";
import {
  type StudentTeacherRelation,
  type StudentProfile,
  type User,
} from "@prisma/client";

type RelationWithStudent = StudentTeacherRelation & {
  student: StudentProfile & { user: User | null };
};

interface StudentHeaderProps {
  relation: RelationWithStudent;
  dictionary: Dictionary;
  lang: string;
}

export function StudentHeader({
  relation: { student, customName },
  dictionary,
  lang,
}: StudentHeaderProps) {
  const {
    user,
    tempFirstName,
    tempLastName,
    isClaimed,
    gradeLevel,
    studentNo,
    inviteToken,
    tempAvatarKey,
  } = student;

  // Name Logic
  const displayName =
    customName ||
    user?.name ||
    `${tempFirstName || ""} ${tempLastName || ""}`.trim() ||
    dictionary.student_detail.header.unknown_student;

  // Avatar Logic
  const avatarSrc =
    isClaimed && user
      ? getAvatarUrl(user.image, user.id)
      : tempAvatarKey
        ? tempAvatarKey.startsWith("http")
          ? tempAvatarKey
          : `/api/avatar/student/${student.id}`
        : "/api/avatars/default";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="border-background h-16 w-16 border-2 shadow-sm">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback className="text-lg">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            {isClaimed ? (
              <Badge
                variant="default"
                className="border-green-600/20 bg-green-600/10 text-green-600 hover:bg-green-600/20"
              >
                <Shield className="mr-1 h-3 w-3" />
                {dictionary.student_detail.header.verified}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="border-yellow-600/20 bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20"
              >
                <ShieldAlert className="mr-1 h-3 w-3" />
                {dictionary.student_detail.header.pending}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              {gradeLevel || dictionary.student_detail.header.no_level}
            </span>
            <span>{dictionary.common.separator}</span>
            <span>
              {studentNo || dictionary.student_detail.header.no_number}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isClaimed && (
          <InviteButton
            token={inviteToken}
            lang={lang}
            dictionary={dictionary}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={dictionary.common.more_options}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`?tab=settings`}
                onClick={() => {
                  // This is a bit of a hack to switch tabs if we are using query params or just rely on the user clicking the tab.
                  // Since the tabs are client-side controlled usually, a link might not work unless we control the tab state via URL.
                  // But the user asked to change the menu items.
                  // Let's just make it trigger the settings tab if possible, or just navigate.
                  // Actually, the Tabs component in page.tsx uses defaultValue="overview".
                  // To make it linkable, we'd need to control the value.
                  // For now, let's just assume the user can click the tab, but I'll add a "Settings" item that might just be a visual cue or scroll.
                  // Better yet, let's just use a button that finds the settings tab trigger and clicks it? No that's hacky.
                  // Let's just put a "Settings" link that goes to the settings tab if we implement URL-based tabs,
                  // OR just rely on the fact that the user can click the tab.
                  // But the user specifically asked to change the menu items.
                  // I will add "Settings" which will just be a link to the settings section.
                  const tabs = document.querySelector(
                    '[value="settings"]'
                  ) as HTMLElement;
                  if (tabs) tabs.click();
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                {dictionary.student_detail.tabs.settings || "Ayarlar"}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
