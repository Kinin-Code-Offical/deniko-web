import React from "react";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface AssignmentsCardProps {
  dictionary: Dictionary;
}

const AssignmentsCard: React.FC<AssignmentsCardProps> = ({ dictionary }) => {
  const t = dictionary.home.mock_dashboard;

  return (
    <div className="flex h-full w-full flex-col bg-white p-6 transition-colors dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-widest text-slate-700 uppercase dark:text-slate-200">
            {t.assignments}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {t.assignments_pending}
          </h2>
        </div>
        <div className="rounded-xl bg-purple-100 p-2 dark:bg-purple-900/20">
          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-4">
        {/* Item 1 */}
        <div className="group rounded-2xl border border-purple-100 bg-purple-50 p-4 transition-colors hover:bg-purple-100 dark:border-purple-900/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/20">
          <div className="mb-2 flex items-start justify-between">
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-purple-600 uppercase dark:bg-slate-800 dark:text-purple-400">
              {t.math}
            </span>
            <Clock className="h-4 w-4 text-purple-400 dark:text-purple-500" />
          </div>
          <h3 className="mb-1 font-bold text-gray-800 dark:text-white">
            {t.assignment_math_title}
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            {t.due_tomorrow}
          </p>
        </div>

        {/* Item 2 */}
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 transition-colors hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-900/50">
          <div className="mb-2 flex items-start justify-between">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-800 uppercase dark:bg-slate-700 dark:text-slate-100">
              {t.physics}
            </span>
            <CheckCircle2 className="h-4 w-4 text-gray-300 dark:text-slate-600" />
          </div>
          <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
            {t.assignment_physics_title}
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            {t.due_3days}
          </p>
        </div>

        {/* Item 3 */}
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 transition-colors hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-900/50">
          <div className="mb-2 flex items-start justify-between">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-800 uppercase dark:bg-slate-700 dark:text-slate-100">
              {t.literature}
            </span>
            <CheckCircle2 className="h-4 w-4 text-gray-300 dark:text-slate-600" />
          </div>
          <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
            {t.assignment_lit_title}
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            {t.completed}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsCard;
