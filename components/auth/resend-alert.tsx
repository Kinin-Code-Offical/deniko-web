"use client"

import { useState, useEffect } from "react"
import { resendVerificationCode } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Loader2, MailWarning } from "lucide-react"
import { toast } from "sonner"

interface ResendAlertProps {
    email: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function ResendAlert({ email, dictionary, lang }: ResendAlertProps) {
    const d = dictionary.auth.verification
    const [timeLeft, setTimeLeft] = useState(0)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        // Check cookie on mount
        const checkCooldown = () => {
            const match = document.cookie.match(new RegExp('(^| )resend_cooldown=([^;]+)'))
            if (match) {
                const expiryTime = parseInt(match[2])
                const now = Date.now()
                if (expiryTime > now) {
                    setTimeLeft(Math.ceil((expiryTime - now) / 1000))
                }
            }
        }
        checkCooldown()
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timeLeft])

    const handleResend = async () => {
        setIsPending(true)
        try {
            const result = await resendVerificationCode(email, lang)
            if (result.success) {
                toast.success(d.success)

                // Set cooldown
                const cooldownSeconds = 90
                const expiryTime = Date.now() + (cooldownSeconds * 1000)
                document.cookie = `resend_cooldown=${expiryTime}; path=/; max-age=${cooldownSeconds}`
                setTimeLeft(cooldownSeconds)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error(d.error)
        } finally {
            setIsPending(false)
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-yellow-800">
                <MailWarning className="h-5 w-5" />
                <span className="font-medium text-sm">{d.unverified_title}</span>
            </div>
            <p className="text-xs text-yellow-700">
                {d.unverified_desc}
            </p>
            <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={timeLeft > 0 || isPending}
                className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900 bg-white"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        {d.sending}
                    </>
                ) : timeLeft > 0 ? (
                    d.wait.replace("{time}", formatTime(timeLeft))
                ) : (
                    d.resend_button
                )}
            </Button>
        </div>
    )
}
