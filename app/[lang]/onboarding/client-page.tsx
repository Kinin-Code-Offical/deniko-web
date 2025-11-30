"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { completeOnboarding } from "@/app/actions/onboarding"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, School, GraduationCap, LogOut, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { cn } from "@/lib/utils"

interface OnboardingClientPageProps {
    dictionary: any
    lang: string
    userId?: string
}

export function OnboardingClientPage({ dictionary, lang, userId }: OnboardingClientPageProps) {
    const { update } = useSession()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [role, setRole] = useState<"TEACHER" | "STUDENT">("STUDENT")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleLogout = async () => {
        await logout()
    }

    const handleSubmit = () => {
        if (!phoneNumber) {
            toast.error(dictionary.auth.register.validation?.phone_min || "Phone number is required")
            return
        }
        if (!password || !confirmPassword) {
            toast.error(dictionary.auth.register.validation?.password_min || "Password is required")
            return
        }
        if (password !== confirmPassword) {
            toast.error(dictionary.auth.register.validation?.password_mismatch || "Passwords do not match")
            return
        }
        if (password.length < 8) {
            toast.error(dictionary.auth.register.validation?.password_min || "Password must be at least 8 characters")
            return
        }

        if (!termsAccepted) {
            toast.error("Please accept the terms and conditions")
            return
        }

        startTransition(async () => {
            try {
                const result = await completeOnboarding({
                    role,
                    phoneNumber,
                    password,
                    confirmPassword,
                    userId
                })
                if (result.success) {
                    await update({ role })
                    router.push(`/${lang}/dashboard`)
                    router.refresh()
                } else {
                    toast.error(result.error || "Something went wrong")
                }
            } catch (error) {
                toast.error("Something went wrong")
            }
        })
    }

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
            {/* Left Panel - Brand (Desktop) */}
            <div className="hidden md:flex w-1/2 bg-[#2062A3] relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        <circle cx="90" cy="10" r="20" fill="white" />
                        <circle cx="10" cy="90" r="10" fill="white" />
                    </svg>
                </div>

                {/* Top: Logo */}
                <div className="relative z-10">
                    <DenikoLogo className="text-white h-12 w-auto" />
                </div>

                {/* Middle: Quote */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        {dictionary.auth.register.hero_title}
                    </h1>
                    <p className="text-blue-100 text-lg">
                        {dictionary.auth.register.hero_desc}
                    </p>
                </div>

                {/* Bottom: Copyright */}
                <div className="relative z-10 text-sm text-blue-200">
                    © 2025 Deniko. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form (Interaction) */}
            <div className="flex-1 flex flex-col relative bg-white">
                {/* Desktop Language Switcher */}
                <div className="hidden md:block absolute top-6 right-6 z-20">
                    <LanguageSwitcher />
                </div>

                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
                    <DenikoLogo className="text-[#2062A3] h-8 w-auto" />
                    <LanguageSwitcher />
                </div>

                {/* Center Content */}
                <div className="w-full max-w-[480px] p-6 mx-auto my-auto flex flex-col gap-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            {dictionary.auth.onboarding.title}
                        </h2>
                        <p className="text-gray-500">
                            {dictionary.auth.onboarding.subtitle}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <Label>{dictionary.auth.register.role_select}</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Student Card */}
                                <div
                                    onClick={() => setRole("STUDENT")}
                                    className={cn(
                                        "border-2 rounded-xl p-4 cursor-pointer transition-all relative flex flex-col items-center gap-3 text-center hover:border-[#2062A3] hover:bg-blue-50",
                                        role === "STUDENT" ? "border-[#2062A3] bg-blue-50" : "border-gray-200"
                                    )}
                                >
                                    {role === "STUDENT" && (
                                        <div className="absolute top-2 right-2 text-[#2062A3]">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className={cn("p-3 rounded-full", role === "STUDENT" ? "bg-blue-100 text-[#2062A3]" : "bg-gray-100 text-gray-500")}>
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{dictionary.auth.register.student}</div>
                                        <div className="text-xs text-gray-500 mt-1">{dictionary.auth.register.student_desc}</div>
                                    </div>
                                </div>

                                {/* Teacher Card */}
                                <div
                                    onClick={() => setRole("TEACHER")}
                                    className={cn(
                                        "border-2 rounded-xl p-4 cursor-pointer transition-all relative flex flex-col items-center gap-3 text-center hover:border-[#2062A3] hover:bg-blue-50",
                                        role === "TEACHER" ? "border-[#2062A3] bg-blue-50" : "border-gray-200"
                                    )}
                                >
                                    {role === "TEACHER" && (
                                        <div className="absolute top-2 right-2 text-[#2062A3]">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className={cn("p-3 rounded-full", role === "TEACHER" ? "bg-blue-100 text-[#2062A3]" : "bg-gray-100 text-gray-500")}>
                                        <School className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{dictionary.auth.register.teacher}</div>
                                        <div className="text-xs text-gray-500 mt-1">{dictionary.auth.register.teacher_desc}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                            <Label>{dictionary.auth.register.phone}</Label>
                            <PhoneInput
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                            />
                        </div>

                        {/* Password Fields */}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>{dictionary.auth.register.password}</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{dictionary.auth.register.password_confirm}</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#2062A3] focus:ring-[#2062A3]"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {lang === 'tr' ? "Kullanım koşullarını kabul ediyorum" : "I accept the terms and conditions"}
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="w-full bg-[#2062A3] hover:bg-[#1a4f83] h-11 text-base"
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {dictionary.auth.onboarding.submitting}
                                </>
                            ) : (
                                dictionary.auth.onboarding.submit
                            )}
                        </Button>
                    </div>

                    {/* Logout Button */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {dictionary.dashboard.nav.logout}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
