"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Archive, Loader2 } from "lucide-react"
import { updateStudent, unlinkStudent, deleteStudent } from "@/app/actions/student"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StudentEditFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
}

export function StudentEditForm({ student, dictionary }: StudentEditFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Determine initial values
    const relation = student.teacherRelations?.[0]
    const isClaimed = student.isClaimed

    // Name logic: Custom > Temp > User
    let initialFirstName = student.tempFirstName || student.user?.firstName || ""
    let initialLastName = student.tempLastName || student.user?.lastName || ""

    if (relation?.customName) {
        const parts = relation.customName.split(" ")
        if (parts.length > 1) {
            initialLastName = parts.pop() || ""
            initialFirstName = parts.join(" ")
        } else {
            initialFirstName = relation.customName
            initialLastName = ""
        }
    }

    const [formData, setFormData] = useState({
        name: initialFirstName,
        surname: initialLastName,
        studentNo: student.studentNo || "",
        grade: student.gradeLevel || "",
        phoneNumber: student.phoneNumber || student.user?.phoneNumber || "",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        parentEmail: student.parentEmail || "",
        avatarUrl: relation?.customAvatar || student.avatarUrl || student.user?.image || ""
    })

    const handleUpdate = () => {
        startTransition(async () => {
            const result = await updateStudent({
                studentId: student.id,
                firstName: formData.name,
                lastName: formData.surname,
                phone: formData.phoneNumber,
                avatarUrl: formData.avatarUrl
            })

            if (result.success) {
                toast.success("Student updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update")
            }
        })
    }

    const handleArchive = () => {
        if (!confirm("Are you sure you want to archive this student? They will be hidden from your active list.")) return

        startTransition(async () => {
            const result = await unlinkStudent(student.id)
            if (result.success) {
                toast.success(result.message)
                router.push("/dashboard/students")
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return

        startTransition(async () => {
            const result = await deleteStudent(student.id)
            if (result.success) {
                toast.success(result.message)
                router.push("/dashboard/students")
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <div className="space-y-6">
            {isClaimed && (
                <Alert>
                    <AlertTitle>Claimed Profile</AlertTitle>
                    <AlertDescription>
                        This student has claimed their profile. You can only edit their display name and avatar for your view.
                        Contact details are managed by the student.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{dictionary.dashboard.student_detail.profile.title}</CardTitle>
                    <CardDescription>
                        Update student's personal information and contact details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.surname}
                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentNo">Student No</Label>
                            <Input
                                id="studentNo"
                                value={formData.studentNo}
                                onChange={(e) => setFormData({ ...formData, studentNo: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade Level</Label>
                            <Input
                                id="grade"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">{dictionary.dashboard.student_detail.profile.contact_parent}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="parentName">Parent Name</Label>
                            <Input
                                id="parentName"
                                value={formData.parentName}
                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentPhone">Parent Phone</Label>
                            <Input
                                id="parentPhone"
                                value={formData.parentPhone}
                                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentEmail">Parent Email</Label>
                            <Input
                                id="parentEmail"
                                value={formData.parentEmail}
                                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                disabled={isClaimed}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpdate} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {dictionary.dashboard.student_detail.profile.save}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions for this student account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleArchive} disabled={isPending}>
                        <Archive className="mr-2 h-4 w-4" />
                        {dictionary.dashboard.student_detail.profile.archive_student}
                    </Button>
                    <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDelete} disabled={isPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {dictionary.dashboard.student_detail.profile.delete_student}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
