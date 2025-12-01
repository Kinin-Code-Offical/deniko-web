"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface StudentData {
    id: string
    name: string
    email?: string | null
    status: string
    studentNo: string | null
    inviteToken: string | null
    isClaimed: boolean
    gradeLevel: string | null
}

interface StudentTableProps {
    data: StudentData[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function StudentTable({ data, dictionary, lang }: StudentTableProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const copyInviteLink = (token: string) => {
        const url = `${window.location.origin}/${lang}/join/${token}`
        navigator.clipboard.writeText(url)
        toast.success(lang === 'tr' ? "Davet linki kopyalandı" : "Invite link copied")
    }

    const filteredData = data.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.studentNo && student.studentNo.includes(searchQuery))
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={dictionary.dashboard.students.search_placeholder || "Search students..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{dictionary.dashboard.students.table.name}</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.status}</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.student_no}</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.grade}</TableHead>
                            <TableHead className="text-right">{dictionary.dashboard.students.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {dictionary.dashboard.students.no_results || "No students found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{student.name}</span>
                                            {student.email && (
                                                <span className="text-xs text-muted-foreground">{student.email}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {student.isClaimed ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                {lang === 'tr' ? 'Onaylı' : 'Verified'}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                                {lang === 'tr' ? 'Davet Bekliyor' : 'Pending Invite'}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{student.studentNo || "-"}</TableCell>
                                    <TableCell>{student.gradeLevel || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!student.isClaimed && student.inviteToken && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => copyInviteLink(student.inviteToken!)}
                                                    title={lang === 'tr' ? 'Davet Linkini Kopyala' : 'Copy Invite Link'}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="sr-only">Copy Invite Link</span>
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/${lang}/dashboard/students/${student.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Details</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
