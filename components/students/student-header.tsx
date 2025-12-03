"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, MoreHorizontal, Shield, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StudentHeaderProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relation: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
}

export function StudentHeader({ relation, dictionary }: StudentHeaderProps) {
    const student = relation.student
    const user = student.user

    // Name Logic
    const displayName = relation.customName || user?.name || `${student.tempFirstName || ''} ${student.tempLastName || ''}`.trim() || "Unknown Student"

    // Avatar Logic
    const avatarSrc = student.isClaimed && user?.image
        ? user.image
        : student.tempAvatar
            ? (student.tempAvatar.startsWith("http")
                ? (student.tempAvatar.includes("dicebear.com")
                    ? `/api/files/defaults/${new URL(student.tempAvatar).searchParams.get("seed")}.svg`
                    : student.tempAvatar)
                : `/api/files/${student.tempAvatar}`)
            : undefined

    const copyInviteLink = () => {
        if (!student.inviteToken) return
        const url = `${window.location.origin}/join/${student.inviteToken}`
        navigator.clipboard.writeText(url)
        toast.success(dictionary.student_detail.header.link_copied)
    }

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className="text-lg">
                        {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                        {student.isClaimed ? (
                            <Badge variant="default" className="bg-green-600/10 text-green-600 hover:bg-green-600/20 border-green-600/20">
                                <Shield className="mr-1 h-3 w-3" />
                                {dictionary.student_detail.header.verified}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20 border-yellow-600/20">
                                <ShieldAlert className="mr-1 h-3 w-3" />
                                {dictionary.student_detail.header.pending}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{student.gradeLevel || dictionary.student_detail.header.no_level}</span>
                        <span>•</span>
                        <span>{student.studentNo || dictionary.student_detail.header.no_number}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!student.isClaimed && (
                    <Button variant="outline" size="sm" onClick={copyInviteLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        {dictionary.student_detail.header.invite_link}
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={copyInviteLink}>
                            {dictionary.student_detail.header.copy_link}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
