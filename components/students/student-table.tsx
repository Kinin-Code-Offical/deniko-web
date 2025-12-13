"use client";

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
import { getAvatarUrl } from "@/lib/utils";
import { Search, ChevronRight, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentData {
  id: string;
  // Raw fields for name logic
  user?: { id: string; name?: string | null; image?: string | null } | null;
  tempFirstName?: string | null;
  tempLastName?: string | null;
  tempAvatarKey?: string | null;
  tempPhone?: string | null;
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
  phoneNumber?: string | null;
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
  const router = useRouter();

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest("button, a")) return;
    router.push(`/${lang}/dashboard/students/${student.id}`);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
          onClick={handleRowClick}
        >
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={
                    student.isClaimed && student.user
                      ? getAvatarUrl(student.user.image, student.user.id)
                      : student.tempAvatarKey
                        ? student.tempAvatarKey.startsWith("http")
                          ? student.tempAvatarKey
                          : `/api/avatar/student/${student.id}`
                        : "/api/avatars/default"
                  }
                  alt={getDisplayName(student)}
                />
                <AvatarFallback>
                  {getDisplayName(student).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium dark:text-white">
                  {getDisplayName(student)}
                </span>
                {student.email && (
                  <span className="text-muted-foreground text-xs">
                    {student.email}
                  </span>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {student.phoneNumber || student.tempPhone || "-"}
            </span>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {student.gradeLevel || "-"}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <div className="flex flex-wrap gap-1">
              {student.classrooms && student.classrooms.length > 0 ? (
                student.classrooms.map((c, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs dark:border-slate-700 dark:text-slate-300"
                  >
                    {c.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">
                  {dictionary.common.empty_placeholder}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              {!student.isClaimed && student.inviteToken && (
                <InviteButton
                  token={student.inviteToken}
                  lang={lang}
                  dictionary={dictionary}
                />
              )}
            </div>
          </TableCell>
          <TableCell>
            {student.isClaimed ? (
              <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {dictionary.dashboard.students.status.verified}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
              >
                {dictionary.dashboard.students.status.pending}
              </Badge>
            )}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end">
              {/* Desktop View Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 md:flex"
                asChild
              >
                <Link href={`/${lang}/dashboard/students/${student.id}`}>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span className="sr-only">
                    {dictionary.dashboard.students.actions.view_details}
                  </span>
                </Link>
              </Button>

              {/* Mobile Dropdown */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/${lang}/dashboard/students/${student.id}`)
                      }
                    >
                      {dictionary.dashboard.students.actions.view_details}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/${lang}/dashboard/students/${student.id}?tab=lessons`
                        )
                      }
                    >
                      {dictionary.dashboard.students.actions.lessons}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/${lang}/dashboard/students/${student.id}?tab=homework`
                        )
                      }
                    >
                      {dictionary.dashboard.students.actions.assign_homework}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/${lang}/dashboard/students/${student.id}?tab=classes`
                        )
                      }
                    >
                      {dictionary.dashboard.students.actions.classes}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/${lang}/dashboard/students/${student.id}?tab=settings`
                        )
                      }
                    >
                      {dictionary.dashboard.students.actions.settings}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            router.push(`/${lang}/dashboard/students/${student.id}?tab=lessons`)
          }
        >
          {dictionary.dashboard.students.actions.lessons}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            router.push(
              `/${lang}/dashboard/students/${student.id}?tab=homework`
            )
          }
        >
          {dictionary.dashboard.students.actions.assign_homework}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            router.push(`/${lang}/dashboard/students/${student.id}?tab=classes`)
          }
        >
          {dictionary.dashboard.students.actions.classes}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            router.push(
              `/${lang}/dashboard/students/${student.id}?tab=settings`
            )
          }
        >
          {dictionary.dashboard.students.actions.settings}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
        <TableCell colSpan={7} className="h-24 text-center dark:text-slate-400">
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
            className="pl-8 dark:border-slate-800 dark:bg-slate-900"
            aria-label={dictionary.dashboard.students.search_placeholder}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border dark:border-slate-800">
        <Table
          className={
            isPending ? "opacity-50 transition-opacity" : "transition-opacity"
          }
        >
          <TableCaption>{dictionary.dashboard.students.title}</TableCaption>
          <TableHeader>
            <TableRow className="dark:border-slate-800">
              <TableHead className="dark:text-slate-400">
                {dictionary.dashboard.students.columns.name}
              </TableHead>
              <TableHead className="hidden md:table-cell dark:text-slate-400">
                {dictionary.dashboard.students.columns.phone}
              </TableHead>
              <TableHead className="hidden md:table-cell dark:text-slate-400">
                {dictionary.dashboard.students.columns.level}
              </TableHead>
              <TableHead className="hidden md:table-cell dark:text-slate-400">
                {dictionary.dashboard.students.columns.class}
              </TableHead>
              <TableHead className="text-right dark:text-slate-400">
                {dictionary.dashboard.students.columns.invite}
              </TableHead>
              <TableHead className="dark:text-slate-400">
                {dictionary.dashboard.students.columns.status}
              </TableHead>
              <TableHead className="text-right dark:text-slate-400">
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
