"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dashboardConfig } from "@/config/dashboard"
import { UserNav } from "@/components/dashboard/user-nav"
import { Menu, X, GraduationCap, Search } from "lucide-react"

interface DashboardShellProps {
    children: React.ReactNode
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: "TEACHER" | "STUDENT" | "ADMIN"
    }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const navItems = user.role === "TEACHER"
        ? dashboardConfig.teacherNav
        : user.role === "STUDENT"
            ? dashboardConfig.studentNav
            : []

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <GraduationCap className="h-6 w-6" />
                    <span>Deniko</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white md:hidden pt-16 px-4">
                    <nav className="flex flex-col gap-2 mt-4">
                        {navItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                        pathname === item.href
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.title}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="mt-8 border-t pt-4">
                        <div className="flex items-center gap-3 px-4">
                            <UserNav user={user} />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-slate-500">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-slate-50/40 min-h-screen">
                <div className="p-6 border-b h-16 flex items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <GraduationCap className="h-6 w-6" />
                        <span>Deniko</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        pathname === item.href
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                {/* User info removed from bottom sidebar as it is now in header */}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Desktop Header */}
                <header className="hidden md:flex h-16 items-center justify-between border-b px-6 bg-white">
                    <div className="flex items-center gap-4 w-full max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Ara..."
                                className="w-full bg-slate-50 pl-9 md:w-[300px] lg:w-[400px]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
