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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentData {
    id: string
    // Raw fields for name logic
    user?: { name?: string | null, image?: string | null } | null
    tempFirstName?: string | null
    tempLastName?: string | null
    tempAvatar?: string | null
    relation?: { customName?: string | null } | null

    // Fallback or pre-calculated
    name: string
    email?: string | null
    status: string
    studentNo: string | null
    inviteToken: string | null
    isClaimed: boolean
    gradeLevel: string | null
    classrooms: { name: string }[]
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

    // Helper to get display name
    const getDisplayName = (student: StudentData) => {
        if (student.relation?.customName) return student.relation.customName
        if (student.user?.name) return student.user.name
        if (student.tempFirstName || student.tempLastName) {
            return `${student.tempFirstName || ''} ${student.tempLastName || ''}`.trim()
        }
        return student.name || "Unknown"
    }

    const filteredData = data.filter(student => {
        const displayName = getDisplayName(student)
        return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.studentNo && student.studentNo.includes(searchQuery))
    })

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
                            <TableHead>Sınıflar</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.status}</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.student_no}</TableHead>
                            <TableHead>{dictionary.dashboard.students.table.grade}</TableHead>
                            <TableHead className="text-right">{dictionary.dashboard.students.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    {dictionary.dashboard.students.no_results || "No students found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src={
                                                        student.isClaimed && student.user?.image
                                                            ? student.user.image
                                                            : student.tempAvatar
                                                                ? `/api/files/${student.tempAvatar}`
                                                                : undefined
                                                    }
                                                    alt={getDisplayName(student)}
                                                />
                                                <AvatarFallback>
                                                    {getDisplayName(student).substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{getDisplayName(student)}</span>
                                                {student.email && (
                                                    <span className="text-xs text-muted-foreground">{student.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {student.classrooms && student.classrooms.length > 0 ? (
                                                student.classrooms.map((c, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {c.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
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
