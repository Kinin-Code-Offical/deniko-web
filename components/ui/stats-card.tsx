"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  hint: string;
  trend?: "up" | "down" | "neutral";
  chartData?: number[];
  className?: string;
  delay?: number;
  icon?: React.ReactNode;
}

export function StatsCard({
  label,
  value,
  suffix = "",
  hint,
  trend = "up",
  chartData = [10, 25, 45, 30, 60, 75, 50, 90],
  className,
  delay = 0,
  icon,
}: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Parse target value
  let targetValue = 0;
  let displaySuffix = suffix;

  if (typeof value === "number") {
    targetValue = value;
  } else {
    // Try to parse "120+" or "4.5K"
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericPart)) {
      if (value.includes("K")) {
        targetValue = numericPart * 1000;
        displaySuffix = "K"; // Force K suffix if present in original
      } else {
        targetValue = numericPart;
      }

      if (value.includes("+") && !displaySuffix.includes("+")) {
        displaySuffix = "+" + displaySuffix;
      }
    }
  }

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 60,
    restDelta: 0.1,
  });

  const displayValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(targetValue);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, targetValue, motionValue, delay]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (displayValueRef.current) {
        let formatted = Math.floor(latest).toLocaleString();

        // Handle K formatting for animation
        if (
          (displaySuffix.includes("K") ||
            (typeof value === "string" && value.includes("K"))) &&
          latest >= 1000
        ) {
          formatted = (latest / 1000).toFixed(1);
        }

        displayValueRef.current.textContent = formatted;
      }
    });
  }, [springValue, displaySuffix, value]);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-md",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-muted-foreground/70 text-[11px] font-bold tracking-widest uppercase">
              {label}
            </p>
            {icon && (
              <div className="text-blue-500/20 transition-colors group-hover:text-blue-500/40">
                {icon}
              </div>
            )}
          </div>

          <div className="mb-1 flex items-baseline gap-1">
            <span
              ref={displayValueRef}
              className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
            >
              {0}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {displaySuffix}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-500">{hint}</p>
      </div>

      {/* Mini Chart Background */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.15]">
        <svg
          viewBox="0 0 100 40"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`gradient-${label}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0 40 ${chartData.map((d, i) => `L${(i / (chartData.length - 1)) * 100} ${40 - (d / 100) * 40}`).join(" ")} L100 40 Z`}
            fill={`url(#gradient-${label})`}
            className={trend === "up" ? "text-blue-600" : "text-emerald-600"}
          />
          <path
            d={`M0 40 ${chartData.map((d, i) => `L${(i / (chartData.length - 1)) * 100} ${40 - (d / 100) * 40}`).join(" ")}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className={trend === "up" ? "text-blue-600" : "text-emerald-600"}
          />
        </svg>
      </div>
    </div>
  );
}
