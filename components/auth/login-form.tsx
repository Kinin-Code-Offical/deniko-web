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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

interface LoginFormProps {
    dictionary: any
    lang: string
}

export function LoginForm({ dictionary, lang }: LoginFormProps) {
    const d = dictionary.auth.login
    const [isPending, startTransition] = useTransition()

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
        startTransition(async () => {
            const result = await login(values, lang)
            if (result && !result.success) {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md space-y-8 relative">
                <div className="absolute top-0 right-0">
                    <LanguageSwitcher />
                </div>
                <div className="flex flex-col items-center text-center pt-10">
                    <DenikoLogo className="h-16 w-16 text-[#2062A3] mb-6" />
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {d.title}
                    </h1>
                    <p className="mt-2 text-slate-600">
                        {d.subtitle}
                    </p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-xl">{d.card_title}</CardTitle>
                        <CardDescription>
                            {d.card_desc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <GoogleLoginButton />

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
                                                <Input placeholder="ornek@email.com" {...field} />
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
                                                <Input placeholder="******" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-[#2062A3] hover:bg-[#1a4f83]" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {d.submit}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            {d.no_account}{" "}
                            <Link href={`/${lang}/register`} className="underline">
                                {d.register_link}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
