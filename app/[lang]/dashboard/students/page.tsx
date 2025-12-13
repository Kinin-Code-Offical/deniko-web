import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import { StudentTable } from "@/components/students/student-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const baseUrl = "https://deniko.net";
  const pathname = "/dashboard/students";

  return {
    title: dict.metadata.students.title,
    description: dict.metadata.students.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}${pathname}`,
      languages: {
        "tr-TR": `/tr${pathname}`,
        "en-US": `/en${pathname}`,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function StudentsPage({
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
    include: {
      teacherProfile: true,
    },
  });

  if (!user || user.role !== "TEACHER" || !user.teacherProfile) {
    redirect(`/${lang}/dashboard`);
  }

  const relations = await db.studentTeacherRelation.findMany({
    where: { teacherId: user.teacherProfile.id },
    include: {
      student: {
        include: {
          user: true,
          classrooms: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const classrooms = await db.classroom.findMany({
    where: { teacherId: user.teacherProfile.id },
    select: { id: true, name: true },
  });

  const students = relations.map((rel) => ({
    id: rel.student.id,
    user: rel.student.user,
    tempFirstName: rel.student.tempFirstName,
    tempLastName: rel.student.tempLastName,
    tempAvatarKey: rel.student.tempAvatarKey,
    tempPhone: rel.student.tempPhone,
    relation: { customName: rel.customName },
    name:
      rel.customName ||
      (rel.student.isClaimed && rel.student.user?.name
        ? rel.student.user.name
        : `${rel.student.tempFirstName || ""} ${rel.student.tempLastName || ""}`.trim()),
    email: rel.student.isClaimed ? rel.student.user?.email : null,
    status: rel.student.isClaimed ? "CLAIMED" : "SHADOW",
    studentNo: rel.student.studentNo,
    inviteToken: rel.student.inviteToken,
    isClaimed: rel.student.isClaimed,
    gradeLevel: rel.student.gradeLevel,
    classrooms: rel.student.classrooms,
    phoneNumber: rel.student.isClaimed ? rel.student.user?.phoneNumber : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.students.title}
        </h2>
        <AddStudentDialog dictionary={dictionary} classrooms={classrooms} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.students.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable data={students} dictionary={dictionary} lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
