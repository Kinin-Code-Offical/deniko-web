"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Clock, Star } from "lucide-react";

import type { Dictionary } from "@/types/i18n";

interface ActivityStatsCardProps {
  stats: {
    lessons: number;
    students: number;
    hours: number;
    rating: number | string;
  };
  dictionary: Dictionary;
}

export function ActivityStatsCard({
  stats,
  dictionary,
}: ActivityStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {dictionary.dashboard.profile.activity_stats.title}
        </CardTitle>
        <CardDescription>
          {dictionary.dashboard.profile.activity_stats.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
            <BookOpen className="mb-2 h-6 w-6 text-blue-500" />
            <span className="text-2xl font-bold">{stats.lessons}</span>
            <span className="text-muted-foreground text-xs">
              {dictionary.dashboard.profile.activity_stats.lessons}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
            <Users className="mb-2 h-6 w-6 text-green-500" />
            <span className="text-2xl font-bold">{stats.students}</span>
            <span className="text-muted-foreground text-xs">
              {dictionary.dashboard.profile.activity_stats.students}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
            <Clock className="mb-2 h-6 w-6 text-orange-500" />
            <span className="text-2xl font-bold">{stats.hours}</span>
            <span className="text-muted-foreground text-xs">
              {dictionary.dashboard.profile.activity_stats.hours}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
            <Star className="mb-2 h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.rating}</span>
            <span className="text-muted-foreground text-xs">
              {dictionary.dashboard.profile.activity_stats.rating}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
