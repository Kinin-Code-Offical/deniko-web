"use client";

import React, { useState, useCallback, memo } from "react";
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
import { Menu, type LucideIcon, Bell, LogOut } from "lucide-react";
import { teacherNav, studentNav } from "@/config/dashboard";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/actions/user";
import type { Dictionary } from "@/types/i18n";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "TEACHER" | "STUDENT" | "ADMIN" | null;
    username?: string | null;
  };
  dictionary: Dictionary;
  lang: string;
}

const NavItem = memo(
  ({
    item,
    mobile = false,
    lang,
    pathname,
    dictionary,
    onMobileClick,
  }: {
    item: { title: string; href: string; icon: LucideIcon };
    mobile?: boolean;
    lang: string;
    pathname: string;
    dictionary: Dictionary;
    onMobileClick?: () => void;
  }) => {
    const href = `/${lang}${item.href}`;
    const isActive = pathname === href;
    const Icon = item.icon;

    return (
      <Link
        href={href}
        onClick={() => mobile && onMobileClick?.()}
        className={cn(
          "group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors",
            isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
          )}
        />
        <span>
          {
            dictionary.dashboard.nav[
              item.title as keyof typeof dictionary.dashboard.nav
            ]
          }
        </span>
        {isActive && (
          <div className="bg-sidebar-primary ml-auto h-1.5 w-1.5 rounded-full shadow-sm" />
        )}
      </Link>
    );
  }
);
NavItem.displayName = "NavItem";

export function DashboardShell({
  children,
  user,
  dictionary,
  lang,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navConfig = user.role === "TEACHER" ? teacherNav : studentNav;

  const handleMobileClick = useCallback(() => setOpen(false), []);

  // Helper to get current page title
  const getCurrentTitle = () => {
    const currentNav = navConfig.find(
      (item) => pathname === `/${lang}${item.href}`
    );
    if (currentNav) {
      return dictionary.dashboard.nav[
        currentNav.title as keyof typeof dictionary.dashboard.nav
      ];
    }
    // Fallback for subpages or unknown routes
    if (pathname.includes("/messages"))
      return dictionary.dashboard.nav.messages;
    if (pathname.includes("/notifications"))
      return dictionary.dashboard.nav.notifications;
    if (pathname.includes("/profile")) return dictionary.dashboard.nav.profile;
    if (pathname.includes("/settings"))
      return dictionary.dashboard.nav.settings;
    if (pathname.includes("/files")) return dictionary.dashboard.nav.files;

    return dictionary.dashboard.nav.dashboard;
  };

  return (
    <div className="bg-background flex min-h-dvh">
      {/* Desktop Sidebar */}
      <aside className="border-sidebar-border bg-sidebar fixed inset-y-0 z-50 hidden w-[260px] flex-col border-r md:flex">
        <div className="flex h-16 items-center px-6">
          <Link
            href={`/${lang}/dashboard`}
            className="text-sidebar-primary flex items-center gap-2 text-xl font-bold"
          >
            <DenikoLogo className="h-7 w-7" />
            <span className="text-sidebar-foreground tracking-tight">
              {dictionary.common.app_name}
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            {navConfig.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                lang={lang}
                pathname={pathname}
                dictionary={dictionary}
              />
            ))}
          </nav>
        </div>

        <div className="border-sidebar-border border-t p-4">
          <Button
            variant="ghost"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-4 w-full justify-start gap-3"
            onClick={() => signOutAction()}
          >
            <LogOut className="h-4 w-4" />
            <span>{dictionary.dashboard.header.logout}</span>
          </Button>

          <div className="bg-sidebar-accent rounded-xl p-4">
            <p className="text-sidebar-foreground/70 text-xs font-medium">
              {dictionary.dashboard.nav.menu_desc}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sidebar-foreground/70 text-xs">
                {dictionary.dashboard.nav.system_operational}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 md:pl-[260px]">
        {/* Header */}
        <header className="border-border bg-background/80 fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md md:left-[260px] md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  suppressHydrationWarning
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="border-border bg-card text-foreground flex w-[260px] flex-col border-r p-0"
              >
                <SheetTitle className="sr-only">
                  {dictionary.dashboard.nav.menu_title}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {dictionary.dashboard.nav.menu_desc}
                </SheetDescription>
                <div className="border-border flex h-16 items-center border-b px-6">
                  <div className="text-primary flex items-center gap-2 text-xl font-bold">
                    <DenikoLogo className="h-7 w-7" />
                    <span>{dictionary.common.app_name}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <nav className="space-y-1.5">
                    {navConfig.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        mobile
                        lang={lang}
                        pathname={pathname}
                        dictionary={dictionary}
                        onMobileClick={handleMobileClick}
                      />
                    ))}
                  </nav>
                </div>

                <div className="border-border space-y-4 border-t p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {dictionary.dashboard.settings.theme}
                    </span>
                    <ThemeToggle labels={dictionary.theme} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {dictionary.dashboard.settings.language}
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Page Title / Breadcrumb */}
            <div className="hidden md:block">
              <h1 className="text-foreground text-lg font-semibold">
                {getCurrentTitle()}
              </h1>
            </div>

            {/* Mobile Logo */}
            <div className="text-primary flex items-center gap-2 text-xl font-bold md:hidden">
              <DenikoLogo className="h-6 w-6" />
              <span>{dictionary.common.app_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:block">
              <ThemeToggle labels={dictionary.theme} />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground relative"
              asChild
            >
              <Link href={`/${lang}/dashboard/notifications`}>
                <Bell className="h-5 w-5" />
                <span className="ring-background absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2" />
                <span className="sr-only">
                  {dictionary.dashboard.notifications.title}
                </span>
              </Link>
            </Button>

            <div className="bg-border h-6 w-px" />

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <UserNav
              user={user}
              dictionary={dictionary}
              lang={lang}
              className="h-[50px] w-[50px] border border-slate-200 p-0 dark:border-slate-700"
            />
          </div>
        </header>

        <main id="main-content" className="flex-1 pt-16">
          <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
