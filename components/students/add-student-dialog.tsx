"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createShadowStudent } from "@/lib/actions/student"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2),
    surname: z.string().min(2),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    phoneNumber: z.string().optional(),
    avatar: z.any().optional(),
})

export function AddStudentDialog({ dictionary }: { dictionary: any }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            surname: "",
            studentNo: "",
            grade: "",
            phoneNumber: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("surname", values.surname)
            if (values.studentNo) formData.append("studentNo", values.studentNo)
            if (values.grade) formData.append("grade", values.grade)
            if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber)
            // Avatar upload logic will be implemented later
            // if (values.avatar) formData.append("avatarUrl", "URL_FROM_UPLOAD")

            const result = await createShadowStudent(null, formData)
            if (result?.success) {
                toast.success(dictionary.dashboard.students.add_dialog.success)
                setOpen(false)
                form.reset()
            } else {
                toast.error(result?.error || "Error")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> {dictionary.dashboard.students.add_student}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{dictionary.dashboard.students.add_dialog.title}</DialogTitle>
                    <DialogDescription>
                        {dictionary.dashboard.students.add_dialog.desc}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.dashboard.students.add_dialog.name}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.dashboard.students.add_dialog.surname}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="studentNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.dashboard.students.add_dialog.student_no}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dictionary.dashboard.students.add_dialog.grade}</FormLabel>
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
                                    <FormLabel>{dictionary.dashboard.students.add_dialog.phone_number}</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Profile Photo</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                onChange(event.target.files?.[0])
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {dictionary.dashboard.students.add_dialog.submit}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
