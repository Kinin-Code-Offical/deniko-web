"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
        router.push(redirectedPathName(locale))
    }

    return (
        <div className="flex gap-2">
            {i18n.locales.map((locale) => (
                <Button
                    key={locale}
                    variant={currentLocale === locale ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageChange(locale)}
                    className={currentLocale === locale ? "bg-[#2062A3]" : ""}
                >
                    {locale.toUpperCase()}
                </Button>
            ))}
        </div>
    )
}
