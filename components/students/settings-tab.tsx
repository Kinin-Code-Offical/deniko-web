"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhoneInput } from "@/components/ui/phone-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2, Lock, Trash2, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateStudentRelation, unlinkStudent, deleteShadowStudent } from "@/app/actions/student"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const settingsSchema = z.object({
    customName: z.string().optional(),
    phoneNumber: z.string().optional(),
    privateNotes: z.string().optional(),
})

interface StudentSettingsTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relation: any
    studentId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
}

export function StudentSettingsTab({ relation, studentId, dictionary }: StudentSettingsTabProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const student = relation.student
    const isClaimed = student.isClaimed

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            customName: relation.customName || "",
            phoneNumber: (isClaimed ? student.user?.phoneNumber : student.tempPhone) || "",
            privateNotes: relation.privateNotes || "",
        },
    })

    function onSubmit(values: z.infer<typeof settingsSchema>) {
        startTransition(async () => {
            const result = await updateStudentRelation(studentId, values)
            if (result.success) {
                toast.success(dictionary.student_detail.settings.success)
                router.refresh()
            } else {
                toast.error(result.error || "Bir hata oluştu")
            }
        })
    }

    const handleUnlink = async () => {
        const result = await unlinkStudent(studentId)
        if (result.success) {
            toast.success(dictionary.student_detail.settings.archive.success)
            router.push("/dashboard/students")
        } else {
            toast.error(result.error || "Hata oluştu")
        }
    }

    const handleDelete = async () => {
        const result = await deleteShadowStudent(studentId)
        if (result.success) {
            toast.success(dictionary.student_detail.settings.delete.success)
            router.push("/dashboard/students")
        } else {
            toast.error(result.error || "Hata oluştu")
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{dictionary.student_detail.settings.title}</CardTitle>
                    <CardDescription>
                        {dictionary.student_detail.settings.desc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="customName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.student_detail.settings.custom_name}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={student.tempFirstName || "İsim giriniz"} {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {dictionary.student_detail.settings.custom_name_desc}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.student_detail.settings.phone}</FormLabel>
                                        <FormControl>
                                            {isClaimed ? (
                                                <div className="relative">
                                                    <Input {...field} disabled className="pl-10" />
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <PhoneInput
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        </FormControl>
                                        {isClaimed && (
                                            <FormDescription>
                                                {dictionary.student_detail.settings.phone_claimed_desc}
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="privateNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.student_detail.settings.notes}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={dictionary.student_detail.settings.notes_desc}
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isPending ? dictionary.student_detail.settings.saving : dictionary.student_detail.settings.save}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">{dictionary.student_detail.settings.danger_zone}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <div className="font-medium">{dictionary.student_detail.settings.archive.title}</div>
                            <div className="text-sm text-muted-foreground">
                                {dictionary.student_detail.settings.archive.desc}
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-destructive hover:text-destructive">
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    {dictionary.student_detail.settings.archive.button}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{dictionary.student_detail.settings.archive.confirm_title}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {dictionary.student_detail.settings.archive.confirm_desc}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUnlink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {!isClaimed && (
                        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                            <div className="space-y-0.5">
                                <div className="font-medium text-destructive">{dictionary.student_detail.settings.delete.title}</div>
                                <div className="text-sm text-destructive/80">
                                    {dictionary.student_detail.settings.delete.desc}
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {dictionary.student_detail.settings.delete.button}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{dictionary.student_detail.settings.delete.confirm_title}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {dictionary.student_detail.settings.delete.confirm_desc}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
