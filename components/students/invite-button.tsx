"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface InviteButtonProps {
    inviteToken: string
    lang: string
}

export function InviteButton({ inviteToken, lang }: InviteButtonProps) {
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrigin(window.location.origin)
    }, [])

    const onCopy = () => {
        if (!origin) return
        const inviteLink = `${origin}/${lang}/register?invite=${inviteToken}`
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success("Davet linki kopyalandı!")

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onCopy}>
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy Invite Link</span>
        </Button>
    )
}
