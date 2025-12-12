import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Folder,
} from "lucide-react";

export const teacherNav = [
  {
    title: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
  },
  {
    title: "files",
    href: "/dashboard/files",
    icon: Folder,
  },
  {
    title: "finance",
    href: "/dashboard/finance",
    icon: CreditCard,
  },
  {
    title: "profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const studentNav = [
  {
    title: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "lessons",
    href: "/dashboard/lessons",
    icon: BookOpen,
  },
  {
    title: "files",
    href: "/dashboard/files",
    icon: Folder,
  },
  {
    title: "profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
