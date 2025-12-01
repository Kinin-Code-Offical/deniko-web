"use client"

import * as React from "react"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CookieConsent() {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
        // Check if cookie_consent cookie exists
        const consent = document.cookie
            .split("; ")
            .find((row) => row.startsWith("cookie_consent="))

        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const acceptCookies = () => {
        // Set cookie for 1 year
        document.cookie = "cookie_consent=true; path=/; max-age=31536000; SameSite=Lax"
        setIsVisible(false)
    }

    const declineCookies = () => {
        // Set cookie for session only (or maybe a shorter time to ask again later, but user said "Decline" sets it to false)
        // User requirement: "On 'Decline', set cookie_consent=false and hide."
        document.cookie = "cookie_consent=false; path=/; max-age=31536000; SameSite=Lax"
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-4 flex-1">
                    <div className="p-2 bg-blue-50 rounded-full shrink-0 hidden md:block">
                        <Cookie className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 md:hidden">
                            <Cookie className="h-4 w-4 text-blue-600" />
                            Çerez Tercihleri
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Deniko olarak deneyiminizi iyileştirmek, analitik veriler toplamak ve size özel içerikler sunmak için çerezler kullanıyoruz.
                            Detaylı bilgi için <Link href="/tr/legal/cookies" className="text-blue-600 hover:underline font-medium">Çerez Politikası</Link>&apos;nı inceleyebilirsiniz.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={declineCookies}
                        className="flex-1 md:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                        Reddet
                    </Button>
                    <Button
                        onClick={acceptCookies}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        Kabul Et
                    </Button>
                </div>
            </div>
        </div>
    )
}
