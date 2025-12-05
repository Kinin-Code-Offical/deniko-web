import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TeacherView } from "@/components/dashboard/teacher-view";
import { StudentView } from "@/components/dashboard/student-view";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: isTr ? "Panel | Deniko" : "Dashboard | Deniko",
    description: isTr
      ? "Deniko yönetim paneli ile tüm süreçlerinizi kontrol edin."
      : "Control all your processes with Deniko management dashboard.",
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dictionary = (await getDictionary(lang as Locale)) as any;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
      studentProfile: true,
    },
  });

  if (!user) {
    redirect(`/${lang}/login`);
  }

  // Role Dispatch
  if (user.role === "TEACHER") {
    if (!user.teacherProfile) {
      // Data inconsistency: Teacher role but no profile
      redirect(`/${lang}/onboarding`);
    }

    const activeStudentsCount = await db.studentTeacherRelation.count({
      where: {
        teacherId: user.teacherProfile.id,
        status: "ACTIVE",
      },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLessonsCount = await db.lesson.count({
      where: {
        teacherId: user.teacherProfile.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    const pendingHomeworkCount = await db.homeworkTracking.count({
      where: {
        homework: {
          lesson: {
            teacherId: user.teacherProfile.id,
          },
        },
        status: "SUBMITTED",
      },
    });

    const todaySchedule = await db.lesson.findMany({
      where: {
        teacherId: user.teacherProfile.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
      take: 5,
      orderBy: {
        startTime: "asc",
      },
      include: {
        students: {
          include: {
            user: true,
          },
        },
        classroom: true,
      },
    });

    return (
      <TeacherView
        dictionary={dictionary}
        lang={lang}
        stats={{
          activeStudentsCount,
          todayLessonsCount,
          pendingHomeworkCount,
        }}
        schedule={todaySchedule}
      />
    );
  }

  if (user.role === "STUDENT") {
    if (!user.studentProfile) {
      // Data inconsistency: Student role but no profile
      redirect(`/${lang}/onboarding`);
    }

    const completedLessons = await db.lesson.count({
      where: {
        students: {
          some: {
            id: user.studentProfile.id,
          },
        },
        status: "COMPLETED",
      },
    });

    const homeworkCount = await db.homeworkTracking.count({
      where: {
        studentId: user.studentProfile.id,
        status: {
          not: "COMPLETED",
        },
      },
    });

    const nextLesson = await db.lesson.findFirst({
      where: {
        students: {
          some: {
            id: user.studentProfile.id,
          },
        },
        startTime: {
          gt: new Date(),
        },
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        classroom: true,
      },
    });

    const upcomingLessons = await db.lesson.findMany({
      where: {
        students: {
          some: {
            id: user.studentProfile.id,
          },
        },
        startTime: {
          gte: new Date(),
        },
        status: {
          not: "CANCELLED",
        },
      },
      take: 5,
      orderBy: {
        startTime: "asc",
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        classroom: true,
      },
    });

    const pendingHomeworks = await db.homeworkTracking.findMany({
      where: {
        studentId: user.studentProfile.id,
        status: "PENDING",
      },
      include: {
        homework: {
          include: { lesson: true },
        },
      },
      orderBy: { homework: { dueDate: "asc" } },
      take: 5,
    });

    return (
      <StudentView
        dictionary={dictionary}
        lang={lang}
        stats={{
          completedLessons,
          homeworkCount,
        }}
        nextLesson={nextLesson}
        upcomingLessons={upcomingLessons}
        pendingHomeworks={pendingHomeworks}
      />
    );
  }

  // Fallback for other roles or no role
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Welcome to Deniko</h1>
      <p className="text-muted-foreground">
        Please contact support if you see this screen.
      </p>
    </div>
  );
}
