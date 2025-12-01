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
import { Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface StudentData {
    id: string
    name: string
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
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const copyInviteLink = (token: string, id: string) => {
        const link = `${window.location.origin}/join/${token}`
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        toast.success(dictionary.dashboard.students.add_dialog.copy_invite)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{dictionary.dashboard.students.table.name}</TableHead>
                        <TableHead>{dictionary.dashboard.students.table.status}</TableHead>
                        <TableHead>{dictionary.dashboard.students.table.number}</TableHead>
                        <TableHead className="text-right">{dictionary.dashboard.students.table.action}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {dictionary.dashboard.students.table.empty}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{student.name}</span>
                                        {!student.isClaimed && (
                                            <span className="text-xs text-muted-foreground">
                                                ({dictionary.dashboard.students.table.shadow_account})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {student.isClaimed ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {dictionary.dashboard.students.status.claimed}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            {dictionary.dashboard.students.status.shadow}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span>{student.gradeLevel || "-"}</span>
                                        <span className="text-xs text-muted-foreground">
                                            No: {student.studentNo || "-"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {!student.isClaimed && student.inviteToken && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyInviteLink(student.inviteToken!, student.id)}
                                            >
                                                <Copy className={`h-4 w-4 ${copiedId === student.id ? "text-green-500" : ""}`} />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
