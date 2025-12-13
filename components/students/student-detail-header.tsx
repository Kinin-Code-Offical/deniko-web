"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InviteButton } from "./invite-button";
import type { Dictionary } from "@/types/i18n";
import { type StudentProfile, type User } from "@prisma/client";

type StudentWithUser = StudentProfile & {
  user: User | null;
};

interface StudentDetailHeaderProps {
  student: StudentWithUser;
  dictionary: Dictionary;
  totalLessons: number;
  balance: number;
  lang: string;
}

export function StudentDetailHeader({
  student,
  dictionary,
  totalLessons,
  balance,
  lang,
}: StudentDetailHeaderProps) {
  const {
    isClaimed,
    userId,
    user,
    tempFirstName,
    tempLastName,
    gradeLevel,
    inviteToken,
    tempAvatarKey,
    id,
  } = student;

  const displayName = userId
    ? user?.name || `${user?.firstName} ${user?.lastName}`
    : `${tempFirstName} ${tempLastName}`;

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={
              isClaimed && user
                ? getAvatarUrl(user.image, user.id)
                : tempAvatarKey
                  ? tempAvatarKey.startsWith("http")
                    ? tempAvatarKey
                    : `/api/avatar/student/${id}`
                  : "/api/avatars/default"
            }
            alt={displayName}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <div className="text-muted-foreground flex items-center gap-2">
            <Badge variant={isClaimed ? "default" : "secondary"}>
              {isClaimed
                ? dictionary.student_detail.header.status.active
                : dictionary.student_detail.header.status.shadow}
            </Badge>
            {gradeLevel && (
              <span>
                {dictionary.common.separator} {gradeLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {!isClaimed && inviteToken && (
          <InviteButton
            token={inviteToken}
            lang={lang}
            dictionary={dictionary}
          />
        )}

        <Card className="w-full sm:w-auto">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-center">
              <div className="text-muted-foreground text-xs">
                {dictionary.student_detail.header.total_lessons}
              </div>
              <div className="text-xl font-bold">{totalLessons}</div>
            </div>
            <div className="bg-border h-8 w-px" />
            <div className="text-center">
              <div className="text-muted-foreground text-xs">
                {dictionary.student_detail.header.balance}
              </div>
              <div
                className={`text-xl font-bold ${balance < 0 ? "text-destructive" : "text-primary"}`}
              >
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }).format(balance)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
