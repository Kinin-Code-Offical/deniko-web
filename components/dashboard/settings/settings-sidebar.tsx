"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Lock, Bell, Globe, Cookie, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { Dictionary } from "@/types/i18n";

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
  dictionary: Dictionary["dashboard"]["settings"];
}

export function SettingsSidebar({
  className,
  dictionary,
  ...props
}: SettingsSidebarProps) {
  const items = [
    {
      value: "profile",
      label: dictionary.nav.profile,
      icon: User,
    },
    {
      value: "security",
      label: dictionary.nav.security,
      icon: Shield,
    },
    {
      value: "privacy",
      label: dictionary.nav.privacy,
      icon: Lock,
    },
    {
      value: "notifications",
      label: dictionary.nav.notifications,
      icon: Bell,
    },
    {
      value: "language",
      label: dictionary.nav.language,
      icon: Globe,
    },
    {
      value: "cookies",
      label: dictionary.nav.cookies,
      icon: Cookie,
    },
  ];

  return (
    <aside className={cn("w-full lg:w-1/5", className)} {...props}>
      <TabsList className="flex h-auto w-full flex-col space-y-1 bg-transparent p-0">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary/20 w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md"
          >
            <item.icon className="mr-2 h-4 w-4 shrink-0" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-4 border-t pt-4">
        <form action={logout}>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {dictionary.logout}
          </Button>
        </form>
      </div>
    </aside>
  );
}
