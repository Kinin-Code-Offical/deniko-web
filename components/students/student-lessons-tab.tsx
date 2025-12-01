"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"

interface StudentLessonsTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lessons: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function StudentLessonsTab({ lessons, dictionary, lang }: StudentLessonsTabProps) {
    const dateLocale = lang === "tr" ? tr : enUS

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SCHEDULED":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{dictionary.dashboard.student_detail.lessons.status.scheduled}</Badge>
            case "COMPLETED":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{dictionary.dashboard.student_detail.lessons.status.completed}</Badge>
            case "CANCELLED":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{dictionary.dashboard.student_detail.lessons.status.cancelled}</Badge>
            case "MISSED":
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{dictionary.dashboard.student_detail.lessons.status.missed}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{dictionary.dashboard.student_detail.lessons.title}</CardTitle>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {dictionary.dashboard.student_detail.lessons.add_lesson}
                </Button>
            </CardHeader>
            <CardContent>
                {lessons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {dictionary.dashboard.student_detail.lessons.no_lessons}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(lesson.startTime), "PPP p", { locale: dateLocale })}
                                    </TableCell>
                                    <TableCell>{lesson.title}</TableCell>
                                    <TableCell>{getStatusBadge(lesson.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {lesson.price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: lesson.currency }).format(Number(lesson.price)) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
