"use client";

import { isDicebearUrl } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteButton } from "./invite-button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useMemo, memo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye } from "lucide-react";

interface StudentData {
  id: string;
  // Raw fields for name logic
  user?: { name?: string | null; image?: string | null } | null;
  tempFirstName?: string | null;
  tempLastName?: string | null;
  tempAvatar?: string | null;
  relation?: { customName?: string | null } | null;

  // Fallback or pre-calculated
  name: string;
  email?: string | null;
  status: string;
  studentNo: string | null;
  inviteToken: string | null;
  isClaimed: boolean;
  gradeLevel: string | null;
  classrooms: { name: string }[];
}

import type { Dictionary } from "@/types/i18n";

interface StudentTableProps {
  data: StudentData[];
  dictionary: Dictionary;
  lang: string;
}

// Helper to get display name
const getDisplayName = (student: StudentData) => {
  if (student.relation?.customName) return student.relation.customName;
  if (student.user?.name) return student.user.name;
  if (student.tempFirstName || student.tempLastName) {
    return `${student.tempFirstName || ""} ${student.tempLastName || ""}`.trim();
  }
  return student.name || "Unknown";
};

const StudentRow = memo(function StudentRow({
  student,
  dictionary,
  lang,
}: {
  student: StudentData;
  dictionary: Dictionary;
  lang: string;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={
                student.isClaimed && student.user?.image
                  ? student.user.image
                  : student.tempAvatar
                    ? student.tempAvatar.startsWith("http")
                      ? isDicebearUrl(student.tempAvatar)
                        ? `/api/files/defaults/${new URL(student.tempAvatar).searchParams.get("seed")}.svg`
                        : student.tempAvatar
                      : `/api/files/${student.tempAvatar}`
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
              <span className="text-muted-foreground text-xs">
                {student.email}
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
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
            {dictionary.dashboard.students.status.verified}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            {dictionary.dashboard.students.status.pending}
          </Badge>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {student.studentNo || "-"}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {student.gradeLevel || "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {!student.isClaimed && student.inviteToken && (
            <InviteButton
              token={student.inviteToken}
              lang={lang}
              dictionary={dictionary}
            />
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/${lang}/dashboard/students/${student.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">
                {dictionary.dashboard.students.actions.view_details}
              </span>
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

const StudentRows = memo(function StudentRows({
  data,
  dictionary,
  lang,
}: {
  data: StudentData[];
  dictionary: Dictionary;
  lang: string;
}) {
  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-24 text-center">
          {dictionary.dashboard.students.no_results}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {data.map((student) => (
        <StudentRow
          key={student.id}
          student={student}
          dictionary={dictionary}
          lang={lang}
        />
      ))}
    </>
  );
});

export function StudentTable({ data, dictionary, lang }: StudentTableProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(() => {
    return data.filter((student) => {
      const displayName = getDisplayName(student);
      return (
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.studentNo && student.studentNo.includes(searchQuery))
      );
    });
  }, [data, searchQuery]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder={dictionary.dashboard.students.search_placeholder}
            value={inputValue}
            onChange={handleSearch}
            className="pl-8"
            aria-label={dictionary.dashboard.students.search_placeholder}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table
          className={
            isPending ? "opacity-50 transition-opacity" : "transition-opacity"
          }
        >
          <TableCaption>{dictionary.dashboard.students.title}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                {dictionary.dashboard.students.columns.name}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {dictionary.dashboard.students.columns.class}
              </TableHead>
              <TableHead>
                {dictionary.dashboard.students.columns.status}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {dictionary.dashboard.students.columns.no}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {dictionary.dashboard.students.table.grade}
              </TableHead>
              <TableHead className="text-right">
                {dictionary.dashboard.students.columns.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <StudentRows
              data={filteredData}
              dictionary={dictionary}
              lang={lang}
            />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
