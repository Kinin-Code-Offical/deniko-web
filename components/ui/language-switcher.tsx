"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Globe } from "lucide-react"
import { i18n } from "@/i18n-config"

export function LanguageSwitcher() {
    const pathname = usePathname()
    const router = useRouter()

    const redirectedPathName = (locale: string) => {
        if (!pathname) return "/"
        const segments = pathname.split("/")
        segments[1] = locale
        return segments.join("/")
    }

    const currentLocale = pathname.split("/")[1] || i18n.defaultLocale

    const handleLanguageChange = (locale: string) => {
        // eslint-disable-next-line react-hooks/immutability
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
        router.push(redirectedPathName(locale))
    }

    const localeLabels: Record<string, string> = {
        en: "English",
        tr: "Türkçe",
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-11 rounded-full border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-slate-700 gap-2 shadow-sm data-[state=open]:ring-2 data-[state=open]:ring-[#1d4f87]/20"
                >
                    <Globe className="h-4 w-4 text-[#1d4f87]" />
                    <span>{localeLabels[currentLocale] ?? currentLocale.toUpperCase()}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-2xl border-slate-100 shadow-lg shadow-slate-900/5">
                {i18n.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => handleLanguageChange(locale)}
                        className="flex items-center gap-2 py-3 text-sm"
                    >
                        <Check
                            className={`h-4 w-4 text-[#1d4f87] ${currentLocale === locale ? "opacity-100" : "opacity-0"}`}
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-slate-900 font-semibold">{localeLabels[locale]}</span>
                            <span className="text-[11px] uppercase text-slate-400 tracking-[0.2em]">{locale}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
