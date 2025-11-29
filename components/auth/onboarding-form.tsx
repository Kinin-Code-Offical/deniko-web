"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2, School, GraduationCap, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhoneInput } from "@/components/ui/phone-input"
import { completeOnboarding } from "@/app/actions/complete-onboarding"
import { signIn } from "next-auth/react"

interface OnboardingFormProps {
    dictionary: any
    user: {
        firstName?: string | null
        lastName?: string | null
        email?: string | null
        image?: string | null
    }
    token?: string
}

export function OnboardingForm({ dictionary, user, token }: OnboardingFormProps) {
    const d = dictionary.auth.onboarding
    const dr = dictionary.auth.register
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    const formSchema = z.object({
        firstName: z.string().min(2, dr.validation.first_name_min),
        lastName: z.string().min(2, dr.validation.last_name_min),
        phoneNumber: z.string().regex(/^\+\d{10,15}$/, dr.validation.phone_min),
        role: z.enum(["TEACHER", "STUDENT"], {
            message: dr.validation.role_required,
        }),
        password: z.string()
            .min(8, dr.validation.password_min)
            .regex(/[A-Z]/, dr.validation.password_regex)
            .regex(/[a-z]/, dr.validation.password_regex)
            .regex(/[0-9]/, dr.validation.password_regex)
            .regex(/[^A-Za-z0-9]/, dr.validation.password_regex),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: dr.validation.password_mismatch,
        path: ["confirmPassword"],
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phoneNumber: "",
            role: undefined,
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const result = await completeOnboarding(values, token)
                if (result.success) {
                    toast.success("Profil tamamlandı!")
                    if (token) {
                        await signIn("google", { callbackUrl: "/dashboard" })
                    } else {
                        router.push("/dashboard")
                        router.refresh()
                    }
                } else {
                    toast.error(result.message || "Hata oluştu")
                }
            } catch (error) {
                toast.error("Bir hata oluştu")
            }
        })
    }

    return (
        <Card className="w-full max-w-lg shadow-lg">
            <CardHeader>
                <CardTitle>{d.title}</CardTitle>
                <CardDescription>{d.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Role Selection */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>{dr.role_select}</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="TEACHER" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <School className="mb-3 h-6 w-6" />
                                                    <span className="font-semibold">{dr.teacher}</span>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="STUDENT" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <GraduationCap className="mb-3 h-6 w-6" />
                                                    <span className="font-semibold">{dr.student}</span>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dr.first_name}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dr.last_name}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dr.phone}</FormLabel>
                                    <FormControl>
                                        <PhoneInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dr.password}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dr.password_confirm}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? d.submitting : d.submit}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
