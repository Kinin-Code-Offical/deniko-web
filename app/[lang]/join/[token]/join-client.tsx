"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimStudentProfile } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle,
  User as UserIcon,
  X,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import ConflictResolutionModal, {
  type ConflictData,
  type SelectionSource,
} from "@/components/join/conflict-resolution-modal";
import type { Dictionary } from "@/types/i18n";
import type { StudentProfile, User } from "@prisma/client";

const CONFLICT_KEYS = {
  STUDENT_NO: "student_no",
  PARENT: "parent",
  GRADE: "grade",
  NAME: "name",
  PHONE: "phone",
} as const;

const SOURCE_TYPES = {
  SHADOW: "shadow",
  STUDENT: "student",
} as const;

const PLACEHOLDERS = {
  TEACHER: "{teacher}",
} as const;

interface InviteDetails {
  id: string;
  tempFirstName: string | null;
  tempLastName: string | null;
  tempPhone: string | null;
  studentNo: string | null;
  gradeLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  inviteTokenExpires: Date | null;
  isClaimed: boolean;
  teacherName: string | null;
  teacherImage?: string | null;
  teacherEmail?: string | null;
  teacherId?: string | null;
}

type UserWithProfile = User & {
  studentProfile: StudentProfile | null;
};

interface JoinClientProps {
  dict: Dictionary;
  inviteDetails: InviteDetails;
  userProfile: UserWithProfile | null;
  token: string;
  lang: string;
}

export default function JoinClient({
  dict,
  inviteDetails,
  userProfile,
  token,
  lang,
}: JoinClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  const handleClaim = async () => {
    if (!confirmed) return;

    // Check if email is verified
    if (!userProfile?.emailVerified) {
      toast.error(dict.dashboard.join.email_not_verified);
      return;
    }

    // Check for conflicts if user has a profile
    if (userProfile?.studentProfile) {
      const current = userProfile.studentProfile;
      const shadow = inviteDetails;

      const conflicts: ConflictData = {
        student: {},
        shadow: {},
      };

      let hasConflict = false;

      // Helper to check conflict
      const check = (
        key: string,
        val1: string | null | undefined,
        val2: string | null | undefined
      ) => {
        if (val1 !== val2 && (val1 || val2)) {
          conflicts.student[key] = val1 || null;
          conflicts.shadow[key] = val2 || null;
          hasConflict = true;
        }
      };

      // Name (Informational mostly, as we can't easily update User name via claim)
      // But user asked for it.
      const shadowName = `${shadow.tempFirstName || ""} ${
        shadow.tempLastName || ""
      }`.trim();
      if (userProfile.name !== shadowName && shadowName) {
        conflicts.student[CONFLICT_KEYS.NAME] = userProfile.name;
        conflicts.shadow[CONFLICT_KEYS.NAME] = shadowName;
        hasConflict = true;
      }

      // Phone (User phone vs Shadow tempPhone)
      // Assuming User has phoneNumber. If not, maybe check studentProfile?
      // But studentProfile usually doesn't have own phone in this schema except tempPhone.
      // Let's use userProfile.phoneNumber
      if (userProfile.phoneNumber !== shadow.tempPhone && shadow.tempPhone) {
        conflicts.student[CONFLICT_KEYS.PHONE] = userProfile.phoneNumber;
        conflicts.shadow[CONFLICT_KEYS.PHONE] = shadow.tempPhone;
        hasConflict = true;
      }

      // Student No
      check(CONFLICT_KEYS.STUDENT_NO, current.studentNo, shadow.studentNo);

      // Grade
      check(CONFLICT_KEYS.GRADE, current.gradeLevel, shadow.gradeLevel);

      // Parent Info (Grouped or separate? Let's do separate for UI, group for logic)
      check(CONFLICT_KEYS.PARENT, current.parentName, shadow.parentName);

      if (hasConflict) {
        setConflictData(conflicts);
        setShowConflictModal(true);
        return;
      }
    }

    // No conflicts or no profile, proceed directly
    await executeClaim({
      useTeacherGrade: true,
      useTeacherParentInfo: true,
      useTeacherClassroom: true,
    });
  };

  const executeClaim = async (preferences: {
    useTeacherGrade: boolean;
    useTeacherParentInfo: boolean;
    useTeacherClassroom: boolean;
  }) => {
    setLoading(true);
    try {
      const res = await claimStudentProfile(token, preferences);
      if (res.success) {
        toast.success(dict.dashboard.join.success_title);
        router.push("/dashboard");
      } else {
        toast.error(res.error || dict.dashboard.join.error_generic);
      }
    } catch {
      toast.error(dict.dashboard.join.error_generic);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflict = (
    selections: Record<string, SelectionSource>
  ) => {
    setShowConflictModal(false);

    // Map selections to preferences
    // If 'shadow' is selected, we use teacher's data.
    const preferences = {
      useTeacherGrade:
        selections[CONFLICT_KEYS.STUDENT_NO] === SOURCE_TYPES.SHADOW ||
        selections[CONFLICT_KEYS.GRADE] === SOURCE_TYPES.SHADOW,
      useTeacherParentInfo:
        selections[CONFLICT_KEYS.PARENT] === SOURCE_TYPES.SHADOW,
      useTeacherClassroom: true, // Default to true for now
      useTeacherName: selections[CONFLICT_KEYS.NAME] === SOURCE_TYPES.SHADOW,
    };

    executeClaim(preferences);
  };

  const studentName =
    `${inviteDetails.tempFirstName || ""} ${inviteDetails.tempLastName || ""}`.trim() ||
    dict.dashboard.join.unknown_student;

  const teacherInitials = inviteDetails.teacherName
    ? inviteDetails.teacherName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle labels={dict.theme} />
        <LanguageSwitcher currentLocale={lang} />
      </div>
      <Card className="w-full max-w-md shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-4">
            {/* Teacher Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="border-primary/10 h-16 w-16 border-2">
                <AvatarImage
                  src={getAvatarUrl(
                    inviteDetails.teacherImage,
                    inviteDetails.teacherId || ""
                  )}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs font-medium">
                  {inviteDetails.teacherName ||
                    dict.dashboard.join.unknown_teacher}
                </span>
                {inviteDetails.teacherEmail && (
                  <span className="text-muted-foreground/70 text-[10px]">
                    {inviteDetails.teacherEmail}
                  </span>
                )}
              </div>
            </div>

            <ArrowRight className="text-muted-foreground/50 h-6 w-6" />

            {/* Student Avatar (Target) */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="border-muted-foreground/30 h-16 w-16 border-2 border-dashed">
                <AvatarFallback className="bg-muted/50 text-muted-foreground">
                  <UserIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs font-medium">
                {studentName}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <CardTitle className="text-foreground text-2xl font-bold">
              {dict.dashboard.join.title}
            </CardTitle>
            <CardDescription className="text-base">
              {dict.dashboard.join.desc.replace(
                PLACEHOLDERS.TEACHER,
                inviteDetails.teacherName || ""
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-6">
          {/* Info Box */}
          <div className="bg-muted/50 text-muted-foreground rounded-lg p-4 text-sm">
            <p className="text-center">
              {dict.dashboard.join.invite_desc.replace(
                PLACEHOLDERS.TEACHER,
                inviteDetails.teacherName || dict.dashboard.join.unknown_teacher
              )}
            </p>
          </div>

          {/* Current User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border p-3 dark:border-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    userProfile
                      ? getAvatarUrl(userProfile.image, userProfile.id)
                      : undefined
                  }
                />
                <AvatarFallback>
                  {userProfile?.name?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-foreground truncate text-sm font-medium">
                  {userProfile?.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {userProfile?.email}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(!!c)}
              />
              <Label
                htmlFor="confirm"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dict.dashboard.join.confirm_checkbox}
              </Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button
            className="w-full font-semibold"
            size="lg"
            onClick={handleClaim}
            disabled={loading || !confirmed}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {dict.common.loading}
              </>
            ) : (
              dict.dashboard.join.confirm_button
            )}
          </Button>

          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
            onClick={() => router.push("/dashboard")}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            {dict.dashboard.join.reject}
          </Button>
        </CardFooter>
      </Card>

      {showConflictModal && conflictData && (
        <ConflictResolutionModal
          isOpen={showConflictModal}
          dictionary={dict}
          data={conflictData}
          onResolve={handleResolveConflict}
          onCancel={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
}
