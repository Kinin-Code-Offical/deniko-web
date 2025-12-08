"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Archive, Loader2 } from "lucide-react";
import {
  updateStudent,
  unlinkStudent,
  deleteStudent,
} from "@/app/actions/student";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Dictionary } from "@/types/i18n";
import {
  type StudentProfile,
  type StudentTeacherRelation,
  type User,
} from "@prisma/client";

type StudentWithRelations = StudentProfile & {
  teacherRelations: (StudentTeacherRelation & {
    customAvatar?: string | null;
  })[];
  user: User | null;
};

interface StudentEditFormProps {
  student: StudentWithRelations;
  dictionary: Dictionary;
}

export function StudentEditForm({ student, dictionary }: StudentEditFormProps) {
  // Form for editing student details
  const {
    teacherRelations,
    isClaimed,
    tempFirstName,
    user,
    tempLastName,
    studentNo,
    gradeLevel,
    parentName,
    parentPhone,
    parentEmail,
    id,
  } = student;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Determine initial values
  const relation = teacherRelations?.[0];

  // Name logic: Custom > Temp > User
  let initialFirstName = tempFirstName || user?.firstName || "";
  let initialLastName = tempLastName || user?.lastName || "";

  if (relation?.customName) {
    const parts = relation.customName.split(" ");
    if (parts.length > 1) {
      initialLastName = parts.pop() || "";
      initialFirstName = parts.join(" ");
    } else {
      initialFirstName = relation.customName;
      initialLastName = "";
    }
  }

  const [formData, setFormData] = useState({
    name: initialFirstName,
    surname: initialLastName,
    studentNo: studentNo || "",
    grade: gradeLevel || "",
    phoneNumber: student.tempPhone || user?.phoneNumber || "",
    parentName: parentName || "",
    parentPhone: parentPhone || "",
    parentEmail: parentEmail || "",
    avatarUrl: relation?.customAvatar || user?.image || "",
  });

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateStudent({
        studentId: id,
        firstName: formData.name,
        lastName: formData.surname,
        phone: formData.phoneNumber,
        avatarUrl: formData.avatarUrl,
      });

      if (result.success) {
        toast.success(dictionary.student_detail.profile.update_success);
        router.refresh();
      } else {
        toast.error(
          result.error || dictionary.student_detail.profile.update_error
        );
      }
    });
  };

  const handleArchive = () => {
    if (!confirm(dictionary.student_detail.profile.archive_confirm)) return;

    startTransition(async () => {
      const result = await unlinkStudent(id);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/students");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(dictionary.student_detail.profile.delete_confirm)) return;

    startTransition(async () => {
      const result = await deleteStudent(id);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/students");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {isClaimed && (
        <Alert>
          <AlertTitle>
            {dictionary.student_detail.settings.claimed_profile}
          </AlertTitle>
          <AlertDescription>
            {dictionary.student_detail.settings.claimed_profile_desc}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.student_detail.profile.title}</CardTitle>
          <CardDescription>
            {dictionary.student_detail.profile.desc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {dictionary.auth.register.first_name}
              </Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {dictionary.auth.register.last_name}
              </Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.surname}
                onChange={(e) =>
                  setFormData({ ...formData, surname: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentNo">
                {dictionary.student_detail.overview.student_no}
              </Label>
              <Input
                id="studentNo"
                name="studentNo"
                autoComplete="off"
                value={formData.studentNo}
                onChange={(e) =>
                  setFormData({ ...formData, studentNo: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">
                {dictionary.student_detail.settings.grade_level}
              </Label>
              <Input
                id="grade"
                name="grade"
                autoComplete="off"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {dictionary.student_detail.settings.phone}
              </Label>
              <Input
                id="phone"
                name="phone"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-medium">
            {dictionary.student_detail.profile.contact_parent}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentName">
                {dictionary.student_detail.overview.parent_name}
              </Label>
              <Input
                id="parentName"
                name="parentName"
                autoComplete="name"
                value={formData.parentName}
                onChange={(e) =>
                  setFormData({ ...formData, parentName: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">
                {dictionary.student_detail.overview.parent_phone}
              </Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                autoComplete="tel"
                value={formData.parentPhone}
                onChange={(e) =>
                  setFormData({ ...formData, parentPhone: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">
                {dictionary.student_detail.overview.parent_email}
              </Label>
              <Input
                id="parentEmail"
                name="parentEmail"
                autoComplete="email"
                value={formData.parentEmail}
                onChange={(e) =>
                  setFormData({ ...formData, parentEmail: e.target.value })
                }
                disabled={isClaimed}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {dictionary.student_detail.profile.save}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            {dictionary.student_detail.settings.danger_zone}
          </CardTitle>
          <CardDescription>
            {dictionary.student_detail.settings.danger_zone_desc}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleArchive}
            disabled={isPending}
          >
            <Archive className="mr-2 h-4 w-4" />
            {dictionary.student_detail.profile.archive_student}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {dictionary.student_detail.profile.delete_student}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
