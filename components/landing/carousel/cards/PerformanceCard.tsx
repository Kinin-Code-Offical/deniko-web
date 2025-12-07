"use client";

import React from "react";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load Recharts to reduce initial bundle size
const PerformanceChart = dynamic(() => import("./PerformanceChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
    </div>
  ),
});

import type { Dictionary } from "@/types/i18n";

interface PerformanceCardProps {
  dictionary: Dictionary;
}

const COLORS = ["#10B981", "#E5E7EB"]; // Green and Gray
const DARK_COLORS = ["#10B981", "#334155"]; // Green and Slate-700

const PerformanceCard: React.FC<PerformanceCardProps> = ({ dictionary }) => {
  const t = dictionary.home.mock_dashboard;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [shouldRenderChart, setShouldRenderChart] = React.useState(false);
  const [containerSize, setContainerSize] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const hasSize = width > 0 && height > 0;

        setShouldRenderChart(hasSize);

        if (hasSize) {
          setContainerSize({
            width: Math.max(1, width),
            height: Math.max(1, height),
          });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const data = [
    { name: t.chart.completed, value: 68 },
    { name: t.chart.remaining, value: 32 },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-white p-6 transition-colors dark:bg-slate-900">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t.class_average}
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            {t.overview}
          </p>
        </div>
        <div className="rounded-xl bg-green-100 p-2 dark:bg-green-900/20">
          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center">
        <div ref={containerRef} className="h-[180px] w-full">
          {shouldRenderChart &&
            containerSize.width > 0 &&
            containerSize.height > 0 && (
              <PerformanceChart
                data={data}
                colors={COLORS}
                darkColors={DARK_COLORS}
                width={containerSize.width}
                height={containerSize.height}
              />
            )}
          {/* Centered Percentage */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {68}%
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t.success}
            </span>
          </div>
        </div>
      </div>

      {/* Legend / Stats */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t.completed}
            </span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">{68}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-gray-200 dark:bg-slate-700"></div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t.pending}
            </span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">{12}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
