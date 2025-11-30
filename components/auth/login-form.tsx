"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { ResendAlert } from "@/components/auth/resend-alert"

interface LoginFormProps {
    dictionary: any
    lang: string
}

export function LoginForm({ dictionary, lang }: LoginFormProps) {
    const d = dictionary.auth.login
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

    const formSchema = z.object({
        email: z.string().email(d.validation.email_invalid),
        password: z.string().min(1, d.validation.password_required),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setUnverifiedEmail(null) // Reset state on new attempt
        startTransition(async () => {
            const result = await login(values, lang)
            if (result && !result.success) {
                if (result.error === "NOT_VERIFIED" && result.email) {
                    setUnverifiedEmail(result.email)
                }
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="w-full space-y-6">
            {unverifiedEmail && (
                <ResendAlert email={unverifiedEmail} dictionary={dictionary} lang={lang} />
            )}

            <div className="space-y-6">
                <GoogleLoginButton text={d.google_login} />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">
                            {d.or_email}
                        </span>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{d.email}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ornek@email.com" {...field} className="h-11" />
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
                        <Button type="submit" className="w-full h-11 bg-[#2062A3] hover:bg-[#1a4f83]" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {d.submit}
                        </Button>
                    </form>
                </Form>
                <div className="text-center text-sm">
                    {d.no_account}{" "}
                    <Link href={`/${lang}/register`} className="text-[#2062A3] font-semibold hover:underline">
                        {d.register_link}
                    </Link>
                </div>
            </div>
        </div>
    )
}
