import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  BookOpen,
  FileText,
  PenTool,
} from "lucide-react";

export const teacherNav = [
  {
    title: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    title: "finance",
    href: "/dashboard/finance",
    icon: CreditCard,
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
    title: "lessons",
    href: "/dashboard/lessons",
    icon: BookOpen,
  },
  {
    title: "homework",
    href: "/dashboard/homework",
    icon: FileText,
  },
  {
    title: "exams",
    href: "/dashboard/exams",
    icon: PenTool,
  },
  {
    title: "settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
