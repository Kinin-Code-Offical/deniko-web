"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"

interface StudentHomeworkTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    homeworks: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function StudentHomeworkTab({ homeworks, dictionary, lang }: StudentHomeworkTabProps) {
    const dateLocale = lang === "tr" ? tr : enUS

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{dictionary.dashboard.student_detail.homework.title}</CardTitle>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {dictionary.dashboard.student_detail.homework.assign_homework}
                </Button>
            </CardHeader>
            <CardContent>
                {homeworks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {dictionary.dashboard.student_detail.homework.no_homework}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Lesson</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {homeworks.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(item.homework.dueDate), "PPP", { locale: dateLocale })}
                                    </TableCell>
                                    <TableCell>{item.homework.title}</TableCell>
                                    <TableCell>
                                        {item.status === "PENDING" ? (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                {dictionary.dashboard.student_detail.homework.status.pending}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {dictionary.dashboard.student_detail.homework.status.completed}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {item.homework.lesson.title}
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
