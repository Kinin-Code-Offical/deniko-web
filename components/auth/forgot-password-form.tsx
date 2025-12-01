"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { forgotPassword } from "@/app/actions/auth"
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
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ForgotPasswordFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function ForgotPasswordForm({ dictionary, lang }: ForgotPasswordFormProps) {
    const d = dictionary.auth.forgot_password
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)

    const formSchema = z.object({
        email: z.string().email(dictionary.auth.register.validation.email_invalid),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await forgotPassword(values.email, lang)
            if (result.success) {
                setIsSuccess(true)
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-green-100 p-3">
                    <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold">{d.success}</h3>
                <Button asChild variant="outline" className="mt-4">
                    <Link href={`/${lang}/login`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {d.back_to_login}
                    </Link>
                </Button>
                <Button variant="link" onClick={() => setIsSuccess(false)} className="mt-2 text-sm text-muted-foreground">
                    {d.try_again}
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {d.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {d.desc}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{d.email_label}</FormLabel>
                                <FormControl>
                                    <Input placeholder="ornek@email.com" {...field} className="h-11" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="w-full bg-[#2062A3] hover:bg-[#1a4f83] h-11" type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {d.submitting}
                            </>
                        ) : (
                            d.submit
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center">
                <Link
                    href={`/${lang}/login`}
                    className="text-sm text-muted-foreground hover:text-[#2062A3] flex items-center justify-center"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {d.back_to_login}
                </Link>
            </div>
        </div>
    )
}
