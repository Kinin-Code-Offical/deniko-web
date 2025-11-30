import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { LoginForm } from "@/components/auth/login-form"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { logout } from "@/app/actions/auth"

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const session = await auth()

    if (session?.user) {
        const user = await db.user.findUnique({
            where: { id: session.user.id }
        })

        if (user && user.isActive !== false) {
            if (user.role) {
                redirect(`/${lang}/dashboard`)
            } else {
                redirect(`/${lang}/onboarding`)
            }
        } else {
            await logout()
        }
    }

    const dictionary = await getDictionary(lang)

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
                        href="/"
                        className="inline-flex items-center text-white/80 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {dictionary.common?.back_to_home || "Ana Sayfaya Dön"}
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
                        {dictionary.auth.login.hero_title || "Eğitimde Yeni Bir Dönem"}
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        {dictionary.auth.login.hero_desc || "Öğretmen ve öğrencileri bir araya getiren, modern ve etkili eğitim platformuna hoş geldiniz."}
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col relative bg-white animate-in slide-in-from-right-4 duration-700">
                {/* Mobile Header */}
                <div className="md:hidden p-4 flex justify-between items-center border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-[#2062A3] p-1 rounded-md">
                            <DenikoLogo className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-[#2062A3]">Deniko</span>
                    </Link>
                    <LanguageSwitcher />
                </div>

                {/* Desktop Language Switcher */}
                <div className="hidden md:block absolute top-6 right-6 z-20">
                    <LanguageSwitcher />
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 min-h-[calc(100vh-64px)] md:min-h-screen">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                {dictionary.auth.login.title || "Hoş Geldiniz"}
                            </h1>
                            <p className="text-gray-500 mt-2">
                                {dictionary.auth.login.subtitle || "Hesabınıza giriş yapın"}
                            </p>
                        </div>
                        <LoginForm dictionary={dictionary} lang={lang} />
                    </div>
                </div>
            </div>
        </div>
    )
}
