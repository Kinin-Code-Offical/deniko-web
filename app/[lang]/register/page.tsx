import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { RegisterForm } from "@/components/auth/register-form"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function RegisterPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
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
                        {dictionary.auth.register.hero_title || "Aramıza Katılın"}
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        {dictionary.auth.register.hero_desc || "Binlerce öğrenci ve öğretmenin yer aldığı bu büyük ailede yerinizi alın."}
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2024 Deniko. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col relative bg-white">
                {/* Mobile Header */}
                <div className="md:hidden p-4 flex justify-between items-center border-b">
                    <Link href="/" className="flex items-center gap-2">
                        <DenikoLogo className="h-6 w-6 text-[#2062A3]" />
                        <span className="font-bold text-[#2062A3]">Deniko</span>
                    </Link>
                    <LanguageSwitcher />
                </div>

                {/* Desktop Language Switcher */}
                <div className="hidden md:block absolute top-6 right-6 z-20">
                    <LanguageSwitcher />
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-y-auto">
                    <div className="w-full max-w-xl">
                        <RegisterForm dictionary={dictionary} lang={lang} />
                    </div>
                </div>
            </div>
        </div>
    )
}
