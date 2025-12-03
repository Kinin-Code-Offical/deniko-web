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
import { UserPlus, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(2),
    surname: z.string().min(2),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z.string().email().optional().or(z.literal("")),
    classroomIds: z.array(z.string()).default([]),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddStudentDialog({ dictionary, classrooms = [] }: { dictionary: any, classrooms?: { id: string, name: string }[] }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
            classroomIds: [],
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("surname", values.surname)
            if (values.studentNo) formData.append("studentNo", values.studentNo)
            if (values.grade) formData.append("grade", values.grade)
            if (values.tempPhone) formData.append("tempPhone", values.tempPhone)
            if (values.tempEmail) formData.append("tempEmail", values.tempEmail)

            values.classroomIds.forEach((id) => formData.append("classroomIds", id))

            if (selectedFile) {
                formData.append("avatar", selectedFile)
            }

            const result = await createStudent(formData)
            if (result?.success) {
                toast.success(dictionary.dashboard.students.add_dialog.success)
                handleOpenChange(false)
                form.reset()
                setSelectedFile(null)
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
                        <div className="flex flex-col gap-2">
                            <FormLabel>Profil Fotoğrafı (Opsiyonel)</FormLabel>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                        </div>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seviye Seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mezun">Mezun</SelectItem>
                                                <SelectItem value="12">12. Sınıf</SelectItem>
                                                <SelectItem value="11">11. Sınıf</SelectItem>
                                                <SelectItem value="10">10. Sınıf</SelectItem>
                                                <SelectItem value="9">9. Sınıf</SelectItem>
                                                <SelectItem value="8">8. Sınıf</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            name="classroomIds"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Sınıflar (Opsiyonel)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-auto min-h-10",
                                                        !field.value?.length && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value?.length > 0 ? (
                                                        <div className="flex gap-1 flex-wrap py-1">
                                                            {field.value.map((id) => (
                                                                <Badge variant="secondary" key={id} className="mr-1">
                                                                    {classrooms.find((c) => c.id === id)?.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        "Sınıf Seçiniz"
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Sınıf ara..." />
                                                <CommandList>
                                                    <CommandEmpty>Sınıf bulunamadı.</CommandEmpty>
                                                    <CommandGroup>
                                                        {classrooms.map((classroom) => (
                                                            <CommandItem
                                                                value={classroom.name}
                                                                key={classroom.id}
                                                                onSelect={() => {
                                                                    const current = field.value || []
                                                                    const isSelected = current.includes(classroom.id)
                                                                    if (isSelected) {
                                                                        field.onChange(current.filter((id) => id !== classroom.id))
                                                                    } else {
                                                                        field.onChange([...current, classroom.id])
                                                                    }
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value?.includes(classroom.id)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {classroom.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
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
