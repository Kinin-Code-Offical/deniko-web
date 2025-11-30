import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

export default async function ResetPasswordPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>
    searchParams: Promise<{ token?: string }>
}) {
    const { lang } = await params
    const { token } = await searchParams
    const dictionary = await getDictionary(lang)

    if (!token) {
        redirect(`/${lang}/login`)
    }

    // Server-side token validation
    const existingToken = await db.passwordResetToken.findUnique({
        where: { token },
    })

    const isInvalid = !existingToken || new Date() > existingToken.expires

    if (isInvalid) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {dictionary.auth.reset_password.invalid_link_title}
                        </h1>
                        <p className="text-slate-500">
                            {dictionary.auth.reset_password.invalid_link_desc}
                        </p>
                    </div>
                    <Button asChild className="w-full bg-[#2062A3] hover:bg-[#1a4f83]">
                        <Link href={`/${lang}/forgot-password`}>
                            {dictionary.auth.forgot_password.submit}
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                        <Link href={`/${lang}/login`}>
                            {dictionary.auth.login.back_to_home}
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel - Visual & Brand */}
            <div className="hidden md:flex w-1/2 bg-[#2062A3] p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>

                {/* Logo & Back Button */}
                <div className="relative z-10">
                    <Link href={`/${lang}`} className="inline-flex items-center text-white hover:text-white/80 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {dictionary.auth.login.back_to_home}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <DenikoLogo className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Deniko</span>
                    </div>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {dictionary.auth.reset_password.title}
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        {dictionary.auth.reset_password.desc}
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko Education Technologies
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col relative bg-slate-50">
                {/* Mobile Header */}
                <div className="md:hidden p-6 flex justify-between items-center bg-white border-b">
                    <Link href={`/${lang}`} className="flex items-center gap-2">
                        <div className="bg-[#2062A3] p-1.5 rounded-lg">
                            <DenikoLogo className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-[#2062A3]">Deniko</span>
                    </Link>
                    <LanguageSwitcher />
                </div>

                {/* Desktop Language Switcher */}
                <div className="hidden md:flex justify-end p-6 absolute top-0 right-0 z-20">
                    <LanguageSwitcher />
                </div>

                <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-[400px] bg-white md:bg-transparent p-6 md:p-0 rounded-2xl shadow-sm md:shadow-none border md:border-none border-slate-200">
                        <ResetPasswordForm dictionary={dictionary} lang={lang} token={token} />
                    </div>
                </div>
            </div>
        </div>
    )
}
