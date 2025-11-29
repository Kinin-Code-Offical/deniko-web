"use client"

import { useEffect, useState, useTransition, useRef, Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { verifyEmail, resendVerificationEmailAction } from "@/app/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

function VerifyContent() {
    const searchParams = useSearchParams()
    const params = useParams()
    const lang = params.lang as string || "tr"
    const token = searchParams.get("token")
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()
    const [emailToResend, setEmailToResend] = useState<string | undefined>()
    const [isPending, startTransition] = useTransition()
    const [isResending, startResend] = useTransition()
    const firedRef = useRef(false)

    useEffect(() => {
        if (success || error || firedRef.current) return

        if (!token) {
            setError("Doğrulama kodu bulunamadı.")
            return
        }

        firedRef.current = true

        startTransition(async () => {
            const result = await verifyEmail(token)
            if (result.success) {
                setSuccess(result.message)
            } else {
                setError(result.message)
                // @ts-ignore
                if (result.email) setEmailToResend(result.email)
            }
        })
    }, [token, success, error])

    const handleResend = () => {
        if (!emailToResend) return
        startResend(async () => {
            const result = await resendVerificationEmailAction(emailToResend, lang)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    {isPending ? (
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    ) : success ? (
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    ) : (
                        <XCircle className="h-10 w-10 text-red-600" />
                    )}
                </div>
                <CardTitle className="text-xl">
                    {isPending
                        ? "Doğrulanıyor..."
                        : success
                            ? "E-posta Doğrulandı!"
                            : "Doğrulama Başarısız"}
                </CardTitle>
                <CardDescription className="mt-2">
                    {isPending
                        ? "Lütfen bekleyin, e-posta adresiniz doğrulanıyor."
                        : success
                            ? success
                            : error}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 justify-center pb-6">
                {!isPending && emailToResend && (
                    <Button
                        onClick={handleResend}
                        variant="secondary"
                        disabled={isResending}
                        className="w-full"
                    >
                        {isResending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Doğrulama Kodunu Tekrar Gönder
                    </Button>
                )}
                {!isPending && (
                    <Button asChild variant={success ? "default" : "outline"} className="w-full">
                        <Link href="/login">
                            {success ? "Giriş Yap" : "Giriş Sayfasına Dön"}
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-blue-600" />}>
                <VerifyContent />
            </Suspense>
        </div>
    )
}
