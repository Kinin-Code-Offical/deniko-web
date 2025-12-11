import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/get-dictionary";
import { formatPhoneNumber } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";
import { StudentHeader } from "@/components/students/student-header";
import { StudentSettingsTab } from "@/components/students/settings-tab";
import { StudentNotes } from "@/components/students/student-notes";
import { StudentExamsTab } from "@/components/students/student-exams-tab";
import { StudentAttendanceTab } from "@/components/students/student-attendance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StudentPageProps {
  params: Promise<{
    lang: string;
    studentId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; studentId: string }>;
}): Promise<Metadata> {
  const { lang, studentId } = await params;
  const dictionary = await getDictionary(lang);

  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        tempFirstName: true,
        tempLastName: true,
        isClaimed: true,
        user: {
          select: { name: true },
        },
      },
    });

    let studentName = dictionary.auth.register.student;
    if (student) {
      if (student.isClaimed && student.user?.name) {
        studentName = student.user.name;
      } else {
        const tempName = `${student.tempFirstName || ""} ${
          student.tempLastName || ""
        }`.trim();
        if (tempName) studentName = tempName;
      }
    }

    const title = dictionary.metadata.student_detail.title.replace(
      "{name}",
      studentName
    );
    const description = dictionary.metadata.student_detail.description.replace(
      "{name}",
      studentName
    );

    const baseUrl = "https://deniko.net";
    const pathname = `/dashboard/students/${studentId}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `/${lang}${pathname}`,
        languages: {
          "tr-TR": `/tr${pathname}`,
          "en-US": `/en${pathname}`,
        },
      },
      openGraph: {
        title: `${title} | Deniko`,
        description,
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
  } catch {
    return {
      title: dictionary.metadata.student_detail.fallback_title,
      description: dictionary.metadata.student_detail.fallback_description,
    };
  }
}

export default async function StudentPage({
  params,
  searchParams,
}: StudentPageProps) {
  const { lang, studentId } = await params;
  const { tab } = await searchParams;
  const session = await auth();
  const dictionary = await getDictionary(lang as "en" | "tr");

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile) {
    redirect(`/${lang}/onboarding`);
  }

  // Fetch Student Relation
  let relation;
  try {
    relation = await db.studentTeacherRelation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
            classrooms: true,
            lessons: {
              orderBy: { startTime: "desc" },
              take: 5,
            },
            payments: {
              orderBy: { date: "desc" },
              take: 5,
            },
          },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!relation || relation.status === "ARCHIVED") {
    notFound();
  }

  const activeTab = typeof tab === "string" ? tab : "overview";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground -ml-2"
        >
          <Link href={`/${lang}/dashboard/students`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dictionary.common?.back || "Geri"}
          </Link>
        </Button>
      </div>

      <StudentHeader relation={relation} dictionary={dictionary} lang={lang} />

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview">
            {dictionary.student_detail.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="lessons">
            {dictionary.student_detail.tabs.lessons}
          </TabsTrigger>
          <TabsTrigger value="homework">
            {dictionary.student_detail.tabs.homework}
          </TabsTrigger>
          <TabsTrigger value="exams">
            {dictionary.student_detail.tabs.exams}
          </TabsTrigger>
          <TabsTrigger value="attendance">
            {dictionary.student_detail.tabs.attendance}
          </TabsTrigger>
          <TabsTrigger value="classes">
            {dictionary.student_detail.tabs.classes}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {dictionary.student_detail.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Student Info Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>
                  {dictionary.student_detail.overview.general_info}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.student_no}
                  </p>
                  <p>{relation.student.studentNo || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.grade}
                  </p>
                  <p>{relation.student.gradeLevel || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.phone}
                  </p>
                  <p>
                    {formatPhoneNumber(
                      relation.student.isClaimed
                        ? relation.student.user?.phoneNumber
                        : relation.student.tempPhone
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.email}
                  </p>
                  <p>
                    {relation.student.isClaimed
                      ? relation.student.user?.email
                      : relation.student.tempEmail || "-"}
                  </p>
                </div>

                <div className="mt-2 space-y-1 border-t pt-4 sm:col-span-2">
                  <h4 className="font-semibold">
                    {dictionary.student_detail.overview.parent_info}
                  </h4>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.parent_name}
                  </p>
                  <p>{relation.student.parentName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.parent_phone}
                  </p>
                  <p>{formatPhoneNumber(relation.student.parentPhone)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {dictionary.student_detail.overview.parent_email}
                  </p>
                  <p>{relation.student.parentEmail || "-"}</p>
                </div>
              </CardContent>
            </Card>
            {/* Private Notes Card */}
            <StudentNotes
              studentId={studentId}
              initialNotes={relation.privateNotes}
              dictionary={dictionary}
              lang={lang}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dictionary.student_detail.overview.total_lessons}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relation.student.lessons.length}
                </div>
              </CardContent>
            </Card>
            {/* Add more stats here */}
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.student_detail.lessons.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {dictionary.student_detail.lessons.empty}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homework" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.student_detail.tabs.homework}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {dictionary.student_detail.homework.no_homework}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <StudentExamsTab dictionary={dictionary} lang={lang} />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <StudentAttendanceTab dictionary={dictionary} lang={lang} />
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.student_detail.tabs.classes}</CardTitle>
            </CardHeader>
            <CardContent>
              {relation.student.classrooms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relation.student.classrooms.map((c) => (
                    <Badge key={c.id} variant="secondary">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {dictionary.common.empty_placeholder}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <StudentSettingsTab
            relation={relation}
            studentId={studentId}
            dictionary={dictionary}
            lang={lang}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
