"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { completeOnboarding } from "@/app/actions/onboarding"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, School, GraduationCap, LogOut } from "lucide-react"
import { toast } from "sonner"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"

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
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleLogout = async () => {
        await logout()
    }

    const handleSubmit = () => {
        if (!phoneNumber) {
            toast.error(dictionary.auth.register.validation?.phone_required || "Phone number is required")
            return
        }
        if (!password || !confirmPassword) {
            toast.error("Please set a password")
            return
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        // Basic client-side length check
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        if (!termsAccepted) {
            toast.error(dictionary.auth.register.validation?.terms_required || "You must accept the terms")
            return
        }

        startTransition(async () => {
            try {
                const result = await completeOnboarding({
                    role,
                    phoneNumber,
                    password,
                    confirmPassword,
                    userId // Pass fallback ID
                })
                if (result.success) {
                    // CRITICAL: Update client session
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
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel - Visual & Brand */}
            <div className="hidden md:flex w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2 text-white">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                        >
                            <path d="M22 10v6M2 10v6" />
                            <path d="M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Deniko</span>
                </div>

                {/* Center Illustration / Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/50 rounded-full blur-2xl"></div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-64 w-64 text-white relative z-10"
                        >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            <path d="M8 7h6" />
                            <path d="M8 11h8" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white max-w-md leading-tight">
                        {dictionary.auth.onboarding.title}
                    </h2>
                    <p className="text-blue-100 text-lg max-w-sm">
                        {dictionary.auth.onboarding.subtitle}
                    </p>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko Education Platform
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <Card className="w-full max-w-md shadow-lg border-0">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            {dictionary.auth.onboarding.complete_profile_title || "Complete Your Profile"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {dictionary.auth.onboarding.complete_profile_desc || "We need a few more details to get you started."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{dictionary.auth.register.role_label || "I am a..."}</Label>
                                <RadioGroup
                                    defaultValue="STUDENT"
                                    onValueChange={(val) => setRole(val as "TEACHER" | "STUDENT")}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value="TEACHER" id="teacher" className="peer sr-only" />
                                        <Label
                                            htmlFor="teacher"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <School className="mb-3 h-6 w-6" />
                                            <span className="font-semibold">
                                                {dictionary.auth.register.role_teacher || "Teacher"}
                                            </span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="STUDENT" id="student" className="peer sr-only" />
                                        <Label
                                            htmlFor="student"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <GraduationCap className="mb-3 h-6 w-6" />
                                            <span className="font-semibold">
                                                {dictionary.auth.register.role_student || "Student"}
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{dictionary.auth.register.phone_label || "Phone Number"}</Label>
                                <PhoneInput
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Create Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="terms" className="text-sm font-normal">
                                    {dictionary.auth.register.terms_agreement || "I agree to the Terms of Service and Privacy Policy"}
                                </Label>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait...
                                </>
                            ) : (
                                dictionary.common?.continue || "Continue"
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-primary"
                            onClick={handleLogout}
                            disabled={isPending}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Vazgeç ve Çıkış Yap
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
