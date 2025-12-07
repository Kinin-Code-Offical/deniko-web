import React from "react";
import { Calendar, MapPin } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface ScheduleCardProps {
  dictionary: Dictionary;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ dictionary }) => {
  const t = dictionary.home.mock_dashboard;

  return (
    <div className="flex h-full w-full flex-col bg-white p-6 transition-colors dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-widest text-slate-700 uppercase dark:text-slate-200">
            {t.schedule}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {12} {t.math}
          </h2>
        </div>
        <div className="rounded-xl bg-orange-100 p-2 dark:bg-orange-900/20">
          <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Timeline Items */}
      <div className="flex-1 space-y-4">
        {/* Active Item */}
        <div className="flex gap-4 rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="flex min-w-[50px] flex-col items-center justify-center">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {"09:00"}
            </span>
          </div>
          <div className="flex-1 border-l-2 border-blue-500 pl-4">
            <h3 className="font-bold text-gray-800 dark:text-white">
              {t.math}
            </h3>
            <div className="mt-1 flex items-center text-xs text-slate-700 dark:text-slate-200">
              <MapPin className="mr-1 h-3 w-3" />
              {t.room} {301}
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex gap-4 rounded-2xl border border-transparent bg-gray-50 p-3 dark:bg-slate-800/50">
          <div className="flex min-w-[50px] flex-col items-center justify-center">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {"11:30"}
            </span>
          </div>
          <div className="flex-1 border-l-2 border-gray-300 pl-4 dark:border-slate-600">
            <h4 className="font-bold text-gray-900 dark:text-white">
              {t.physics}
            </h4>
            <div className="mt-1 flex items-center text-xs text-slate-700 dark:text-slate-200">
              <MapPin className="mr-1 h-3 w-3" />
              {t.room} {205}
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex gap-4 rounded-2xl border border-transparent bg-gray-50 p-3 dark:bg-slate-800/50">
          <div className="flex min-w-[50px] flex-col items-center justify-center">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {"13:00"}
            </span>
          </div>
          <div className="flex-1 border-l-2 border-gray-300 pl-4 dark:border-slate-600">
            <h4 className="font-bold text-gray-900 dark:text-white">
              {t.chemistry}
            </h4>
            <div className="mt-1 flex items-center text-xs text-slate-700 dark:text-slate-200">
              <MapPin className="mr-1 h-3 w-3" />
              {t.lab} {2}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
