import React from "react";
import { Bell, MessageCircle, AlertCircle } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface MessagesCardProps {
  dictionary: Dictionary;
}

const MessagesCard: React.FC<MessagesCardProps> = ({ dictionary }) => {
  const t = dictionary.home.mock_dashboard;

  return (
    <div className="flex h-full w-full flex-col bg-white p-6 transition-colors dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-widest text-slate-700 uppercase dark:text-slate-200">
            {t.announcements}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {t.school_board}
          </h2>
        </div>
        <div className="rounded-xl bg-pink-100 p-2 dark:bg-pink-900/20">
          <Bell className="h-5 w-5 text-pink-500 dark:text-pink-400" />
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-1 text-sm font-bold text-gray-800 dark:text-white">
              {t.announcement_exam_title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-100">
              {t.announcement_exam_desc}
            </p>
            <span className="mt-2 block text-[10px] text-slate-700 dark:text-slate-200">
              {t.time_ago["10_min"]}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <MessageCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-1 text-sm font-bold text-gray-800 dark:text-white">
              {t.announcement_match_title}
            </h4>
            <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-100">
              {t.announcement_match_desc}
            </p>
            <span className="mt-2 block text-[10px] text-slate-700 dark:text-slate-200">
              {t.time_ago["2_hours"]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4 dark:border-slate-800">
        <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
          {t.see_all}
        </button>
      </div>
    </div>
  );
};

export default MessagesCard;
