"use client";

import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/user";
import { User, Settings, LogOut } from "lucide-react";

import type { Dictionary } from "@/types/i18n";

import { getAvatarUrl, cn } from "@/lib/utils";

interface UserNavProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    avatarVersion?: number | null;
  };

  dictionary?: Dictionary;
  lang?: string;
  className?: string;
}

export const UserNav = memo(function UserNav({
  user,
  dictionary,
  lang,
  className,
}: UserNavProps) {
  const t = dictionary?.dashboard?.header;
  const avatarUrl = getAvatarUrl(
    user.image,
    user.id || "",
    user.avatarVersion || 0
  );

  if (!t) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("relative h-8 w-8 rounded-full", className)}
          suppressHydrationWarning
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={avatarUrl} alt={user.name || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-2xl border-slate-100 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950"
        align="end"
      >
        <DropdownMenuLabel className="p-3 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium text-slate-900 dark:text-slate-200">
              {user.name}
            </p>
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
              @{user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 py-3 text-sm dark:focus:bg-slate-900"
          >
            <Link href={`/${lang}/users/${user.username}`}>
              <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {t.profile}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 py-3 text-sm dark:focus:bg-slate-900"
          >
            <Link href={`/${lang}/dashboard/settings`}>
              <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {t.settings}
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
        <DropdownMenuItem
          onClick={() => signOutAction()}
          className="flex cursor-pointer items-center gap-2 py-3 text-sm text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:bg-slate-900 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
UserNav.displayName = "UserNav";
