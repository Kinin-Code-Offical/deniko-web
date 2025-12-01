import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { AddStudentDialog } from "@/components/students/add-student-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function StudentsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const dictionary = await getDictionary(lang as Locale) as any
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "TEACHER") {
        redirect(`/${lang}/dashboard`)
    }

    const teacherProfile = await db.teacherProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            studentRelations: {
                where: { status: "ACTIVE" },
                include: {
                    student: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    })

    if (!teacherProfile) {
        return <div>Teacher profile not found</div>
    }

    const students = teacherProfile.studentRelations.map(rel => rel.student)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    {dictionary.dashboard.students.title}
                </h2>
                <AddStudentDialog dictionary={dictionary} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{dictionary.dashboard.students.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{dictionary.dashboard.students.table.name}</TableHead>
                                    <TableHead>{dictionary.dashboard.students.table.number}</TableHead>
                                    <TableHead>{dictionary.dashboard.students.table.status}</TableHead>
                                    <TableHead className="text-right">{dictionary.dashboard.students.table.action}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.user?.name || `${student.tempFirstName} ${student.tempLastName}`}
                                            </TableCell>
                                            <TableCell>{student.studentNo || "-"}</TableCell>
                                            <TableCell>
                                                {student.userId ? (
                                                    <Badge variant="default">Real</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Shadow</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {student.inviteToken && !student.userId && (
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Copy className="h-4 w-4" />
                                                        <span className="sr-only">Copy Invite Link</span>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
