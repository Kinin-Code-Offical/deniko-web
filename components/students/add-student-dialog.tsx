"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createStudent } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { UserPlus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageCropper } from "@/components/ui/image-cropper";
import Image from "next/image";

const DEFAULT_AVATARS = [
  "defaults/Felix.svg",
  "defaults/Aneka.svg",
  "defaults/Zoe.svg",
  "defaults/Jack.svg",
  "defaults/Precious.svg",
  "defaults/Sam.svg",
];

import type { Dictionary } from "@/types/i18n";

const createFormSchema = (dictionary: Dictionary) =>
  z.object({
    name: z.string().min(2, dictionary.errors.name_min_length),
    surname: z.string().min(2, dictionary.errors.surname_min_length),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z
      .string()
      .email(dictionary.errors.invalid_email)
      .optional()
      .or(z.literal("")),
    classroomIds: z.array(z.string()).optional(),
  });

export function AddStudentDialog({
  dictionary,
  classrooms = [],
}: {
  dictionary: Dictionary;
  classrooms?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("action") === "new-student") {
      setTimeout(() => setOpen(true), 0);
    }
  }, [searchParams]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && searchParams.get("action") === "new-student") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const formSchema = createFormSchema(dictionary);
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
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("surname", values.surname);
      if (values.studentNo) formData.append("studentNo", values.studentNo);
      if (values.grade) formData.append("grade", values.grade);
      if (values.tempPhone) formData.append("tempPhone", values.tempPhone);
      if (values.tempEmail) formData.append("tempEmail", values.tempEmail);

      if (values.classroomIds) {
        values.classroomIds.forEach((id) =>
          formData.append("classroomIds", id)
        );
      }

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (selectedAvatar) {
        formData.append("selectedAvatar", selectedAvatar);
      }

      const result = await createStudent(formData);
      if (result?.success) {
        toast.success(dictionary.dashboard.students.add_dialog.success);
        handleOpenChange(false);
        form.reset();
        setSelectedFile(null);
        setSelectedAvatar(null);
      } else {
        const errorMessage = result?.error
          ? dictionary.errors[result.error as keyof typeof dictionary.errors] ||
            result.error
          : "Error";
        toast.error(errorMessage);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />{" "}
          {dictionary.dashboard.students.add_student}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dictionary.dashboard.students.add_dialog.title}
          </DialogTitle>
          <DialogDescription>
            {dictionary.dashboard.students.add_dialog.desc}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-3">
              <FormLabel>
                {dictionary.dashboard.students.add_dialog.avatar}
              </FormLabel>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {DEFAULT_AVATARS.map((avatar) => (
                  <div
                    key={avatar}
                    className={cn(
                      "relative cursor-pointer rounded-full border-2 p-0.5 transition-all",
                      selectedAvatar === avatar
                        ? "border-primary"
                        : "hover:border-muted-foreground/50 border-transparent"
                    )}
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setSelectedFile(null);
                    }}
                  >
                    <Image
                      src={
                        avatar.startsWith("http")
                          ? avatar
                          : avatar.startsWith("defaults/")
                            ? `/api/avatars/default/${avatar.replace("defaults/", "")}`
                            : "/api/avatars/default"
                      }
                      alt={dictionary.dashboard.students.add_dialog.avatar}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTempFile(file);
                        setShowCropper(true);
                        // Reset input value so same file can be selected again if needed
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                {(selectedFile || selectedAvatar) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedAvatar(null);
                    }}
                  >
                    {dictionary.dashboard.students.add_dialog.clear}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.dashboard.students.add_dialog.name}
                    </FormLabel>
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
                    <FormLabel>
                      {dictionary.dashboard.students.add_dialog.surname}
                    </FormLabel>
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
                    <FormLabel>
                      {dictionary.dashboard.students.add_dialog.student_no}
                    </FormLabel>
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
                    <FormLabel>
                      {dictionary.dashboard.students.add_dialog.grade}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              dictionary.dashboard.students.add_dialog
                                .select_grade
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mezun">
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .graduated
                          }
                        </SelectItem>
                        <SelectItem value="12">
                          {12}
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .suffix
                          }
                        </SelectItem>
                        <SelectItem value="11">
                          {11}
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .suffix
                          }
                        </SelectItem>
                        <SelectItem value="10">
                          {10}
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .suffix
                          }
                        </SelectItem>
                        <SelectItem value="9">
                          {9}
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .suffix
                          }
                        </SelectItem>
                        <SelectItem value="8">
                          {8}
                          {
                            dictionary.dashboard.students.add_dialog.grades
                              .suffix
                          }
                        </SelectItem>
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
                  <FormLabel>
                    {dictionary.dashboard.students.add_dialog.phone_number}
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      labels={dictionary.common.phone_input}
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
                  <FormLabel>
                    {dictionary.dashboard.students.add_dialog.email}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={
                        dictionary.dashboard.students.add_dialog
                          .email_placeholder
                      }
                    />
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
                  <FormLabel>
                    {dictionary.dashboard.students.add_dialog.classrooms}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "h-auto min-h-10 w-full justify-between",
                            (!field.value || field.value.length === 0) &&
                              "text-muted-foreground"
                          )}
                        >
                          {field.value && field.value.length > 0 ? (
                            <div className="flex flex-wrap gap-1 py-1">
                              {field.value.map((id) => (
                                <Badge
                                  variant="secondary"
                                  key={id}
                                  className="mr-1"
                                >
                                  {classrooms.find((c) => c.id === id)?.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            dictionary.dashboard.students.add_dialog
                              .select_classrooms
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[400px] p-0"
                      aria-label={
                        dictionary.dashboard.students.add_dialog
                          .select_classrooms
                      }
                    >
                      <Command>
                        <CommandInput
                          placeholder={
                            dictionary.dashboard.students.add_dialog
                              .search_classroom
                          }
                        />
                        <CommandList>
                          <CommandEmpty>
                            {
                              dictionary.dashboard.students.add_dialog
                                .no_classroom_found
                            }
                          </CommandEmpty>
                          <CommandGroup>
                            {classrooms.map((classroom) => (
                              <CommandItem
                                value={classroom.name}
                                key={classroom.id}
                                onSelect={() => {
                                  const current = field.value || [];
                                  const isSelected = current.includes(
                                    classroom.id
                                  );
                                  if (isSelected) {
                                    field.onChange(
                                      current.filter(
                                        (id) => id !== classroom.id
                                      )
                                    );
                                  } else {
                                    field.onChange([...current, classroom.id]);
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

      <ImageCropper
        open={showCropper}
        onOpenChange={setShowCropper}
        file={tempFile}
        onCrop={(croppedFile) => {
          setSelectedFile(croppedFile);
          setSelectedAvatar(null);
        }}
        labels={{
          save: dictionary.common.crop_save,
          zoom: dictionary.common.zoom,
          reset: dictionary.common.reset,
          title: dictionary.common.edit_photo,
          description: dictionary.common.crop_description,
          crop_preview: dictionary.common.crop_preview,
        }}
      />
    </Dialog>
  );
}
