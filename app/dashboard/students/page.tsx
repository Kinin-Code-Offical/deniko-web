import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { StudentTable } from "@/components/students/student-table"
import { AddStudentDialog } from "@/components/students/add-student-dialog"

export default async function StudentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  })

  if (!user?.teacherProfile) {
    // If not a teacher, redirect to dashboard (or show error)
    redirect("/dashboard")
  }

  const students = await db.studentTeacherRelation.findMany({
    where: {
      teacherId: user.teacherProfile.id,
      status: "ACTIVE", // Only show active students
    },
    include: {
      student: {
        include: {
          user: true, // To get real name if claimed
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Öğrencilerim</h2>
          <p className="text-muted-foreground">
            Tüm öğrencilerinizi buradan yönetebilir ve yeni öğrenci ekleyebilirsiniz.
          </p>
        </div>
        <AddStudentDialog />
      </div>

      <StudentTable data={students} />
    </div>
  )
}
