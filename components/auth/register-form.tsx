"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Loader2, User, GraduationCap, CheckCircle2, Eye, EyeOff } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhoneInput } from "@/components/ui/phone-input"
import { registerUser } from "@/app/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"

interface RegisterFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function RegisterForm({ dictionary, lang }: RegisterFormProps) {
    const d = dictionary.auth.register
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const registerSchema = z.object({
        firstName: z.string().min(2, d.validation.first_name_min),
        lastName: z.string().min(2, d.validation.last_name_min),
        email: z.string().email(d.validation.email_invalid),
        phoneNumber: z.string().regex(/^\+\d{10,15}$/, d.validation.phone_min),
        role: z.enum(["TEACHER", "STUDENT"], {
            message: d.validation.role_required,
        }),
        password: z.string()
            .min(8, d.validation.password_min)
            .regex(/[A-Z]/, d.validation.password_regex)
            .regex(/[a-z]/, d.validation.password_regex)
            .regex(/[0-9]/, d.validation.password_regex)
            .regex(/[^A-Za-z0-9]/, d.validation.password_regex),
        confirmPassword: z.string(),
        terms: z.boolean().refine(val => val === true, {
            message: dictionary.legal.validation_error
        }),
        marketingConsent: z.boolean().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: d.validation.password_mismatch,
        path: ["confirmPassword"],
    })

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: undefined,
            password: "",
            confirmPassword: "",
            terms: false,
            marketingConsent: false,
        },
    })

    function onSubmit(values: z.infer<typeof registerSchema>) {
        startTransition(async () => {
            try {
                const result = await registerUser(values, lang)
                if (result.success) {
                    setSuccess(true)
                    toast.success(d.success_title)
                } else {
                    toast.error(result.message)
                }
            } catch {
                toast.error("An error occurred")
            }
        })
    }
    if (success) {
        return (
            <div className="w-full text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">{d.success_title}</h2>
                    <p className="text-slate-600">{d.success_desc}</p>
                </div>
                <Button asChild variant="outline" className="w-full h-11">
                    <Link href={`/${lang}/login`}>{d.login_link}</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full space-y-5">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* Role Selection */}
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-base font-semibold text-slate-900">{d.role_select}</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="STUDENT" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-slate-50 hover:text-accent-foreground peer-data-[state=checked]:border-[#2062A3] peer-data-[state=checked]:text-[#2062A3] cursor-pointer transition-all">
                                                <GraduationCap className="mb-3 h-8 w-8" />
                                                <span className="text-lg font-bold">{d.student}</span>
                                                <span className="text-sm text-muted-foreground text-center mt-1">{d.student_desc}</span>
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="TEACHER" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-slate-50 hover:text-accent-foreground peer-data-[state=checked]:border-[#2062A3] peer-data-[state=checked]:text-[#2062A3] cursor-pointer transition-all">
                                                <User className="mb-3 h-8 w-8" />
                                                <span className="text-lg font-bold">{d.teacher}</span>
                                                <span className="text-sm text-muted-foreground text-center mt-1">{d.teacher_desc}</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{d.first_name}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={d.first_name} {...field} className="h-11" />
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
                                    <FormLabel>{d.last_name}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={d.last_name} {...field} className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{d.email}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ornek@email.com" type="email" {...field} className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{d.phone}</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="h-11"
                                            searchPlaceholder={dictionary.components.phone_input.search_country}
                                            noResultsMessage={dictionary.components.phone_input.no_country_found}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{d.password}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="******"
                                                type={showPassword ? "text" : "password"}
                                                {...field}
                                                className="h-11 pr-10"
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
                                    <FormLabel>{d.password_confirm}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="******"
                                                type={showConfirmPassword ? "text" : "password"}
                                                {...field}
                                                className="h-11 pr-10"
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
                    </div>

                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-slate-200 p-3 transition-all duration-200 hover:bg-slate-50 hover:border-[#2062A3]/50">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-[#2062A3] data-[state=checked]:border-[#2062A3] transition-all duration-200"
                                    />
                                </FormControl>
                                <div className="leading-none flex-1">
                                    <FormLabel className="text-sm font-medium text-slate-600 cursor-pointer block">
                                        {dictionary.legal.accept_terms.split(/(\[.*?\])/g).map((part: string, i: number) => {
                                            if (part.startsWith("[") && part.endsWith("]")) {
                                                const content = part.slice(1, -1);
                                                const href = content === dictionary.legal.terms_title || content === "Terms of Service" || content === "Kullanıcı Sözleşmesi"
                                                    ? `/${lang}/legal/terms`
                                                    : `/${lang}/legal/privacy`;
                                                return (
                                                    <Link key={i} href={href} target="_blank" className="font-bold text-[#2062A3] hover:underline hover:text-[#1a4f83] transition-colors">
                                                        {content}
                                                    </Link>
                                                );
                                            }
                                            return part;
                                        })}
                                    </FormLabel>
                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="marketingConsent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-slate-200 p-3 transition-all duration-200 hover:bg-slate-50 hover:border-[#2062A3]/50">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-[#2062A3] data-[state=checked]:border-[#2062A3] transition-all duration-200"
                                    />
                                </FormControl>
                                <div className="leading-none flex-1">
                                    <FormLabel className="text-sm font-medium text-slate-600 cursor-pointer block">
                                        {dictionary.legal.marketing_consent || "Kampanya ve duyurulardan e-posta ile haberdar olmak istiyorum."}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-[#2062A3] hover:bg-[#1a4f83] transition-colors"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {d.submitting}
                            </>
                        ) : (
                            d.submit
                        )}
                    </Button>
                </form>
            </Form>
            <div className="text-center text-sm text-slate-600">
                {d.have_account}{" "}
                <Link href={`/${lang}/login`} className="text-[#2062A3] font-semibold hover:underline">
                    {d.login_link}
                </Link>
            </div>
        </div>
    )
}
