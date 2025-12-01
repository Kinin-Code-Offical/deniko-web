"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Archive } from "lucide-react"

interface StudentEditFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
}

export function StudentEditForm({ student, dictionary }: StudentEditFormProps) {
    return (
        <div className="space-y-6">
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
                            <Input id="firstName" defaultValue={student.tempFirstName || student.user?.firstName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={student.tempLastName || student.user?.lastName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentNo">Student No</Label>
                            <Input id="studentNo" defaultValue={student.studentNo} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade Level</Label>
                            <Input id="grade" defaultValue={student.gradeLevel} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" defaultValue={student.phoneNumber} />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">{dictionary.dashboard.student_detail.profile.contact_parent}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="parentName">Parent Name</Label>
                            <Input id="parentName" defaultValue={student.parentName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentPhone">Parent Phone</Label>
                            <Input id="parentPhone" defaultValue={student.parentPhone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentEmail">Parent Email</Label>
                            <Input id="parentEmail" defaultValue={student.parentEmail} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button>{dictionary.dashboard.student_detail.profile.save}</Button>
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
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Archive className="mr-2 h-4 w-4" />
                        {dictionary.dashboard.student_detail.profile.archive_student}
                    </Button>
                    <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {dictionary.dashboard.student_detail.profile.delete_student}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
