"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createStudent } from "@/app/actions/student"
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
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    name: z.string().min(2),
    surname: z.string().min(2),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z.string().email().optional().or(z.literal("")),
    tempAvatar: z.string().optional(),
    classroomId: z.string().optional(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddStudentDialog({ dictionary, classrooms = [] }: { dictionary: any, classrooms?: { id: string, name: string }[] }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (searchParams.get("action") === "new-student") {
            setOpen(true)
        }
    }, [searchParams])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen && searchParams.get("action") === "new-student") {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("action")
            router.replace(`${pathname}?${params.toString()}`)
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            surname: "",
            studentNo: "",
            grade: "",
            tempPhone: "",
            tempEmail: "",
            tempAvatar: "",
            classroomId: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await createStudent(values)
            if (result?.success) {
                toast.success(dictionary.dashboard.students.add_dialog.success)
                handleOpenChange(false)
                form.reset()
            } else {
                toast.error(result?.error || "Error")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            name="tempPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.dashboard.students.add_dialog.phone_number}</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            searchPlaceholder={dictionary.components.phone_input.search_country}
                                            noResultsMessage={dictionary.components.phone_input.no_country_found}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tempEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta (Opsiyonel)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="ornek@email.com" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="classroomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sınıf (Opsiyonel)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sınıf Seçin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classrooms.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
