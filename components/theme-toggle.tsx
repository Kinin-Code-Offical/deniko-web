"use client";

import * as React from "react";
import { Moon, Sun, Laptop, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  labels?: {
    light: string;
    dark: string;
    system: string;
    toggle_theme?: string;
    loading?: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const t = labels || {
    light: "Light",
    dark: "Dark",
    system: "System",
    toggle_theme: "Toggle theme",
    loading: "Loading...",
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-slate-200 bg-white/50 text-slate-600 shadow-sm"
      >
        <span className="sr-only">{t.loading}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-slate-200 bg-white/50 text-slate-600 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#2062A3] hover:shadow-md hover:shadow-blue-900/5 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 dark:text-blue-400" />
          <span className="sr-only">{t.toggle_theme || "Toggle theme"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl border-slate-100 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 py-3 text-sm dark:focus:bg-slate-900"
        >
          <Check
            className={`h-4 w-4 text-[#1d4f87] dark:text-blue-400 ${theme === "light" ? "opacity-100" : "opacity-0"}`}
          />
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {t.light}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 py-3 text-sm dark:focus:bg-slate-900"
        >
          <Check
            className={`h-4 w-4 text-[#1d4f87] dark:text-blue-400 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
          />
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {t.dark}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 py-3 text-sm dark:focus:bg-slate-900"
        >
          <Check
            className={`h-4 w-4 text-[#1d4f87] dark:text-blue-400 ${theme === "system" ? "opacity-100" : "opacity-0"}`}
          />
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {t.system}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
