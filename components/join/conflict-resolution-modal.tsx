"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  User,
  School,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/types/i18n";

const SOURCE_TYPES = {
  STUDENT: "student",
  SHADOW: "shadow",
} as const;

const COLORS = {
  BLUE: "blue",
  AMBER: "amber",
} as const;

export type ConflictField = string;
export type SelectionSource =
  | typeof SOURCE_TYPES.STUDENT
  | typeof SOURCE_TYPES.SHADOW;

export interface ConflictData {
  student: Record<ConflictField, string | null>;
  shadow: Record<ConflictField, string | null>;
}

interface ConflictResolutionModalProps {
  isOpen?: boolean;
  dictionary: Dictionary;
  data: ConflictData;
  onResolve?: (selections: Record<ConflictField, SelectionSource>) => void;
  onCancel?: () => void;
}

export default function ConflictResolutionModal({
  isOpen = true,
  dictionary,
  data,
  onResolve,
  onCancel,
}: ConflictResolutionModalProps) {
  const t = dictionary.dashboard.join.conflict;

  // Initialize state with 'student' as default selection for all fields
  const [selections, setSelections] = useState<
    Record<ConflictField, SelectionSource>
  >(() => {
    const initial: Record<ConflictField, SelectionSource> = {};
    Object.keys(data.student).forEach((key) => {
      initial[key] = SOURCE_TYPES.STUDENT;
    });
    return initial;
  });

  const handleSelect = (field: ConflictField, source: SelectionSource) => {
    setSelections((prev) => ({ ...prev, [field]: source }));
  };

  const handleSave = () => {
    if (onResolve) {
      onResolve(selections);
    }
  };

  const studentCount = Object.values(selections).filter(
    (s) => s === SOURCE_TYPES.STUDENT
  ).length;
  const shadowCount = Object.values(selections).filter(
    (s) => s === SOURCE_TYPES.SHADOW
  ).length;

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm duration-300 sm:p-4">
      <Card className="border-border bg-background flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-muted/30 shrink-0 border-b p-4 pb-4 sm:p-6 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-12 sm:w-12 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6 dark:text-amber-500" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-foreground text-lg font-bold sm:text-xl">
                {t.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base">
                {t.desc}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Conflict Resolution Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8">
            {Object.keys(data.student).map((field) => (
              <ConflictRow
                key={field}
                field={field}
                label={t.labels[field as keyof typeof t.labels] || field}
                studentValue={data.student[field] || "-"}
                shadowValue={data.shadow[field] || "-"}
                selected={selections[field]}
                onSelect={(source) => handleSelect(field, source)}
                t={t}
              />
            ))}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="bg-muted/30 shrink-0 flex-col items-center justify-between gap-4 border-t p-4 py-4 sm:flex-row sm:p-6 sm:py-6">
          <div className="text-muted-foreground flex w-full flex-col items-center gap-2 text-sm sm:w-auto sm:flex-row sm:gap-3">
            <span className="text-foreground font-medium">
              {t.selected_source}:
            </span>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
              >
                {studentCount} {t.yours}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
              >
                {shadowCount} {t.teachers}
              </Badge>
            </div>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="flex-1 sm:flex-none"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 sm:flex-none dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {t.save_join}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// --- Sub-Component: ConflictRow ---

interface ConflictRowProps {
  field: string;
  label: string;
  studentValue: string;
  shadowValue: string;
  selected: SelectionSource;
  onSelect: (source: SelectionSource) => void;
  t: Dictionary["dashboard"]["join"]["conflict"];
}

function ConflictRow({
  label,
  studentValue,
  shadowValue,
  selected,
  onSelect,
  t,
}: ConflictRowProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="bg-border h-px flex-1" />
        <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm">
          {label}
        </h3>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* Student Card (Left) */}
        <SelectionCard
          source={SOURCE_TYPES.STUDENT}
          title={t.your_profile}
          value={studentValue}
          isSelected={selected === SOURCE_TYPES.STUDENT}
          onClick={() => onSelect(SOURCE_TYPES.STUDENT)}
          icon={<User className="h-4 w-4" />}
          colorClass={COLORS.BLUE}
        />

        {/* Teacher Card (Right) */}
        <SelectionCard
          source={SOURCE_TYPES.SHADOW}
          title={t.teacher_record}
          value={shadowValue}
          isSelected={selected === SOURCE_TYPES.SHADOW}
          onClick={() => onSelect(SOURCE_TYPES.SHADOW)}
          icon={<School className="h-4 w-4" />}
          colorClass={COLORS.AMBER}
        />
      </div>
    </div>
  );
}

interface SelectionCardProps {
  source: SelectionSource;
  title: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  colorClass: typeof COLORS.BLUE | typeof COLORS.AMBER;
}

function SelectionCard({
  title,
  value,
  isSelected,
  onClick,
  icon,
  colorClass,
}: SelectionCardProps) {
  const isBlue = colorClass === COLORS.BLUE;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 p-3 transition-all duration-200 sm:p-4",
        isSelected
          ? isBlue
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-muted bg-card hover:border-muted-foreground/30 hover:bg-accent/50"
      )}
    >
      {/* Selection Indicator */}
      <div
        className={cn(
          "absolute top-2 right-2 transition-opacity duration-200 sm:top-3 sm:right-3",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      >
        <CheckCircle2
          className={cn(
            "h-5 w-5 sm:h-6 sm:w-6",
            isBlue
              ? "text-blue-600 dark:text-blue-400"
              : "text-amber-600 dark:text-amber-400"
          )}
        />
      </div>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            isSelected
              ? isBlue
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
              : "bg-muted text-muted-foreground group-hover:bg-muted/80"
          )}
        >
          {icon}
        </div>
        <div className="space-y-1 pr-6">
          <p
            className={cn(
              "text-[10px] font-semibold tracking-wide uppercase sm:text-xs",
              isSelected
                ? isBlue
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-amber-700 dark:text-amber-300"
                : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <p className="text-foreground text-sm leading-relaxed font-medium break-all sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
