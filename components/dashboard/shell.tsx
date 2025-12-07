"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/dashboard/user-nav";
import { Menu, type LucideIcon } from "lucide-react";
import { teacherNav, studentNav } from "@/config/dashboard";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { Dictionary } from "@/types/i18n";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "TEACHER" | "STUDENT" | "ADMIN" | null;
  };
  dictionary: Dictionary;
  lang: string;
}

export function DashboardShell({
  children,
  user,
  dictionary,
  lang,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navConfig = user.role === "TEACHER" ? teacherNav : studentNav;

  const NavItem = ({
    item,
    mobile = false,
  }: {
    item: { title: string; href: string; icon: LucideIcon };
    mobile?: boolean;
  }) => {
    const href = `/${lang}${item.href}`;
    const isActive = pathname === href;
    const Icon = item.icon;

    return (
      <Link
        href={href}
        onClick={() => mobile && setOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-[#2062A3]/10 text-[#2062A3] dark:bg-blue-900/20 dark:text-blue-400"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        )}
      >
        <Icon className="h-4 w-4" />
        {
          dictionary.dashboard.nav[
            item.title as keyof typeof dictionary.dashboard.nav
          ]
        }
      </Link>
    );
  };

  return (
    <div className="flex min-h-dvh bg-slate-50 transition-colors dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 z-50 hidden w-64 flex-col border-r bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center border-b px-6 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-[#2062A3] dark:text-blue-400"
          >
            <DenikoLogo className="h-6 w-6" />
            <span>Deniko</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navConfig.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Header - Visible on all screens */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 p-0 dark:border-slate-800 dark:bg-slate-900"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Dashboard navigation menu
                </SheetDescription>
                <div className="flex h-16 items-center border-b px-6 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xl font-bold text-[#2062A3] dark:text-blue-400">
                    <DenikoLogo className="h-6 w-6" />
                    <span>Deniko</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <nav className="space-y-1">
                    {navConfig.map((item) => (
                      <NavItem key={item.href} item={item} mobile />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Logo */}
            <div className="flex items-center gap-2 text-xl font-bold text-[#2062A3] md:hidden">
              <DenikoLogo className="h-6 w-6" />
              <span>Deniko</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <UserNav user={user} dictionary={dictionary} />
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
