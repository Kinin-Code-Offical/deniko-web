"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserNav } from "@/components/dashboard/user-nav"
import { Menu } from "lucide-react"
import { teacherNav, studentNav } from "@/config/dashboard"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

interface DashboardShellProps {
    children: React.ReactNode
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: "TEACHER" | "STUDENT" | "ADMIN" | null
    }
    dictionary: any
    lang: string
}

export function DashboardShell({ children, user, dictionary, lang }: DashboardShellProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const navConfig = user.role === "TEACHER" ? teacherNav : studentNav

    const NavItem = ({ item, mobile = false }: { item: any, mobile?: boolean }) => {
        const href = `/${lang}${item.href}`
        const isActive = pathname === href
        const Icon = item.icon

        return (
            <Link
                href={href}
                onClick={() => mobile && setOpen(false)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                        ? "bg-[#2062A3]/10 text-[#2062A3]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
            >
                <Icon className="h-4 w-4" />
                {dictionary.dashboard.nav[item.title]}
            </Link>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-white md:flex fixed inset-y-0 z-50">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-[#2062A3]">
                        <DenikoLogo className="h-6 w-6" />
                        <span>Deniko</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    <nav className="space-y-1">
                        {navConfig.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </nav>
                </div>
                <div className="border-t p-4 space-y-4">
                    <div className="flex justify-center w-full">
                        <LanguageSwitcher />
                    </div>
                    <UserNav user={user} />
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex flex-1 flex-col md:pl-64">
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
                    <div className="flex items-center gap-2 font-bold text-xl text-[#2062A3]">
                        <DenikoLogo className="h-6 w-6" />
                        <span>Deniko</span>
                    </div>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <div className="flex h-16 items-center border-b px-6">
                                <div className="flex items-center gap-2 font-bold text-xl text-[#2062A3]">
                                    <DenikoLogo className="h-6 w-6" />
                                    <span>Deniko</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4 px-3">
                                <nav className="space-y-1">
                                    {navConfig.map((item) => (
                                        <NavItem key={item.href} item={item} mobile />
                                    ))}
                                </nav>
                            </div>
                            <div className="border-t p-4 space-y-4">
                                <div className="flex justify-center w-full">
                                    <LanguageSwitcher />
                                </div>
                                <UserNav user={user} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </header>
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
