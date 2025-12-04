import { getDictionary } from "@/lib/get-dictionary"
import type { Locale } from "@/i18n-config"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ForgotPasswordPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = (await getDictionary(lang))

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
                <div className="relative z-10 flex flex-col gap-6">
                    <Link
                        href={`/${lang}`}
                        className="inline-flex items-center text-white/80 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {dictionary.common?.back_to_home || dictionary.auth.login.back_to_home}
                    </Link>
                    <div className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <DenikoLogo className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Deniko</span>
                    </div>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {dictionary.auth.forgot_password.title}
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        {dictionary.auth.forgot_password.desc}
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-b from-white via-blue-50/60 to-white animate-in slide-in-from-right-4 duration-700">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
                    <div className="px-4 pt-4 flex items-center justify-between">
                        <Link href={`/${lang}`} className="flex items-center gap-2">
                            <div className="bg-[#2062A3] p-1.5 rounded-xl shadow-sm">
                                <DenikoLogo className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-[#2062A3] tracking-tight">Deniko</span>
                        </Link>
                        <LanguageSwitcher />
                    </div>
                    <div className="px-4 pb-4 pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{dictionary.auth.forgot_password.mobile_hint}</span>
                    </div>
                </div>

                {/* Desktop Language Switcher */}
                <div className="hidden md:block absolute top-6 right-6 z-20">
                    <LanguageSwitcher />
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:p-12 min-h-[calc(100vh-72px)] md:min-h-screen">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center md:text-left space-y-2">
                            <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2062A3] mb-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                {dictionary.auth.forgot_password.chip}
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {dictionary.auth.forgot_password.title}
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base">
                                {dictionary.auth.forgot_password.desc}
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <ForgotPasswordForm dictionary={dictionary} lang={lang} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
