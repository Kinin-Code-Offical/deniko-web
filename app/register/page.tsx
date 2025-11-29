"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { registerUser } from "@/app/actions/auth"
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
import { GraduationCap, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
})

export default function RegisterPage() {
    const [isPending, startTransition] = useTransition()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await registerUser(values)
            if (result.success) {
                setSuccessMessage(result.message)
                toast.success(result.message)
                form.reset()
            } else {
                toast.error(result.message)
            }
        })
    }

    if (successMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-slate-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto rounded-full bg-green-100 p-3 mb-4 w-fit">
                            <GraduationCap className="h-10 w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-xl text-green-700">Kayıt Başarılı!</CardTitle>
                        <CardDescription className="text-slate-600 mt-2">
                            {successMessage}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-6">
                        <Button asChild variant="outline">
                            <Link href="/login">Giriş Sayfasına Dön</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                        <GraduationCap className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Deniko'ya Kayıt Ol
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Hemen hesabını oluştur ve eğitime başla
                    </p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-xl">Hesap Oluştur</CardTitle>
                        <CardDescription>
                            Google ile veya e-posta adresinle kayıt ol
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <GoogleLoginButton />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">
                                    Veya E-posta ile
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
                                            <FormLabel>E-posta</FormLabel>
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
                                            <FormLabel>Şifre</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Kayıt Ol
                                </Button>
                            </form>
                        </Form>

                        <p className="text-xs text-center text-slate-500 mt-4">
                            Zaten hesabın var mı?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Giriş Yap
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
