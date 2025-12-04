"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LegalBackButton({ label = "Back" }: { label?: string }) {
    const router = useRouter()

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6 -ml-2 text-slate-500 hover:text-slate-900"
            onClick={() => {
                if (window.history.length > 1) {
                    router.back()
                } else {
                    router.push('/')
                }
            }}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}
