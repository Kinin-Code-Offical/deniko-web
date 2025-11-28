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
import { Copy, Check, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StudentTableProps {
  data: any[] // Replace with proper type
}

export function StudentTable({ data }: StudentTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyInviteLink = (token: string, id: string) => {
    const link = `${window.location.origin}/join/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    toast.success("Davet linki kopyalandı")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Öğrenci Adı</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Okul Bilgisi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Henüz öğrenci eklenmemiş.
              </TableCell>
            </TableRow>
          ) : (
            data.map((relation) => {
              const student = relation.student
              const isShadow = !student.userId
              const name = isShadow
                ? `${student.tempFirstName} ${student.tempLastName}`
                : student.user?.name || `${student.user?.firstName} ${student.user?.lastName}`

              return (
                <TableRow key={relation.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{name}</span>
                      {isShadow && (
                        <span className="text-xs text-muted-foreground">
                          (Gölge Hesap)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.isClaimed ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Davet Bekliyor
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
                          size="sm"
                          onClick={() => copyInviteLink(student.inviteToken!, relation.id)}
                          title="Davet Linkini Kopyala"
                        >
                          {copiedId === relation.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">Kopyala</span>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          <DropdownMenuItem>Ders Programı</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Arşivle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
