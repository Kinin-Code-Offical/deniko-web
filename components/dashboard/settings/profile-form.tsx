"use client";

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  updateProfileBasicAction,
  updateAvatarAction,
} from "@/app/actions/settings";
import { updateUsername } from "@/app/actions/user";
import { uploadAvatarAction } from "@/app/actions/upload";
import { toast } from "sonner";
import { Loader2, Camera, Upload, User } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { AvatarCropper } from "@/components/ui/avatar-cropper";
import { cn, getAvatarUrl } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

import { useRouter } from "next/navigation";

interface ProfileDictionary {
  title: string;
  description: string;
  firstName: string;
  firstNamePlaceholder: string;
  lastName: string;
  lastNamePlaceholder: string;
  success: string;
  save: string;
  saving: string;
  username?: {
    label: string;
    placeholder: string;
    success: string;
    error: string;
  };
  validation: {
    min_length: string;
  };
  files: {
    upload: string;
    [key: string]: string;
  };
  avatar: {
    label: string;
    upload: string;
    upload_hint: string;
    presets: string;
    crop_title: string;
    crop_desc: string;
    cancel: string;
    save: string;
    error_file_type: string;
    error_file_size: string;
    success_update: string;
    error_upload: string;
    error_generic: string;
  };
  phone: {
    label: string;
    placeholder: string;
    countrySelectorLabel: string;
    noResultsMessage: string;
    searchPlaceholder: string;
  };
  teacher?: {
    branch: string;
    branch_placeholder: string;
    bio: string;
    bio_placeholder: string;
  };
  student?: {
    student_no: string;
    student_no_placeholder: string;
    grade_level: string;
    grade_level_placeholder: string;
    parent_name: string;
    parent_name_placeholder: string;
    parent_phone: string;
    parent_email: string;
    parent_email_placeholder: string;
  };
}

interface ProfileFormProps {
  initialData: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    image: string | null;
    phoneNumber?: string | null;
    role: string;
    teacherProfile?: {
      branch: string | null;
      bio: string | null;
    } | null;
    studentProfile?: {
      studentNo: string | null;
      gradeLevel: string | null;
      parentName: string | null;
      parentPhone: string | null;
      parentEmail: string | null;
    } | null;
    avatarVersion?: number | null;
  };
  dictionary: ProfileDictionary;
  lang: string;
  defaultAvatars: { key: string; url: string }[];
}

export function ProfileForm({
  initialData,
  dictionary,
  lang,
  defaultAvatars,
}: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    getAvatarUrl(
      initialData.image,
      initialData.id,
      initialData.avatarVersion || 0
    )
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedFileSrc, setSelectedFileSrc] = useState<string | null>(null);

  const profileSchema = z.object({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9._]+$/),
    firstName: z
      .string()
      .min(
        2,
        dictionary.firstName +
          " " +
          dictionary.validation.min_length.replace("{length}", "2")
      ),
    lastName: z
      .string()
      .min(
        2,
        dictionary.lastName +
          " " +
          dictionary.validation.min_length.replace("{length}", "2")
      ),
    phoneNumber: z.string().optional().nullable(),
    // Teacher fields
    branch: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    // Student fields
    studentNo: z.string().optional().nullable(),
    gradeLevel: z.string().optional().nullable(),
    parentName: z.string().optional().nullable(),
    parentPhone: z.string().optional().nullable(),
    parentEmail: z.string().email().optional().nullable().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialData.username || "",
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      phoneNumber: initialData.phoneNumber || "",
      branch: initialData.teacherProfile?.branch || "",
      bio: initialData.teacherProfile?.bio || "",
      studentNo: initialData.studentProfile?.studentNo || "",
      gradeLevel: initialData.studentProfile?.gradeLevel || "",
      parentName: initialData.studentProfile?.parentName || "",
      parentPhone: initialData.studentProfile?.parentPhone || "",
      parentEmail: initialData.studentProfile?.parentEmail || "",
    },
  });

  function onSubmit(data: z.infer<typeof profileSchema>) {
    startTransition(async () => {
      let hasError = false;

      // 1. Update Username if changed
      if (data.username !== initialData.username) {
        const formData = new FormData();
        formData.append("username", data.username);
        const usernameResult = await updateUsername(formData, lang);
        if (usernameResult?.error) {
          form.setError("username", { message: usernameResult.error });
          toast.error(usernameResult.error);
          hasError = true;
        }
      }

      // 2. Update Basic Profile
      if (!hasError) {
        const result = await updateProfileBasicAction(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            branch: data.branch,
            bio: data.bio,
            studentNo: data.studentNo,
            gradeLevel: data.gradeLevel,
            parentName: data.parentName,
            parentPhone: data.parentPhone,
            parentEmail: data.parentEmail,
          },
          lang
        );
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(dictionary.success);
        }
      }
    });
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(dictionary.avatar.error_file_type);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(dictionary.avatar.error_file_size);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSelectedFileSrc(reader.result as string);
      setCropperOpen(true);
    });
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", croppedBlob, "avatar.jpg");

    try {
      // 1. Upload file
      const uploadResult = await uploadAvatarAction(formData, lang);

      if (uploadResult.success && uploadResult.path) {
        // 2. Update DB
        const updateResult = await updateAvatarAction(
          {
            type: "uploaded",
            url: uploadResult.path,
          },
          lang
        );

        if (updateResult.success) {
          // Optimistic update with new version (assuming +1)
          const newVersion = (initialData.avatarVersion || 0) + 1;
          setAvatarUrl(
            getAvatarUrl(uploadResult.path, initialData.id, newVersion)
          );
          toast.success(dictionary.avatar.success_update);
          router.refresh();
        } else {
          toast.error(updateResult.error || dictionary.avatar.error_upload);
        }
      } else {
        toast.error(uploadResult.error || dictionary.avatar.error_upload);
      }
    } catch {
      toast.error(dictionary.avatar.error_generic);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePresetSelect = async (avatar: { key: string; url: string }) => {
    setIsUploading(true);
    try {
      const result = await updateAvatarAction(
        {
          type: "default",
          key: avatar.key,
        },
        lang
      );
      if (result.success) {
        // Optimistic update with cache-busting
        const newVersion = (initialData.avatarVersion || 0) + 1;
        // Default avatar URL is an API route; add a version query to bypass caches.
        setAvatarUrl(`${avatar.url}?v=${newVersion}`);
        toast.success(dictionary.avatar.success_update);
        router.refresh();
      } else {
        toast.error(result.error || dictionary.avatar.error_upload);
      }
    } catch {
      toast.error(dictionary.avatar.error_generic);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <User className="text-primary h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dictionary.username?.label || "Username"}
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {initialData.username && (
                  // eslint-disable-next-line no-restricted-syntax
                  <p className="text-muted-foreground text-xs">
                    https://deniko.net/users/{initialData.username}{" "}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Avatar Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="border-border relative h-20 w-20 shrink-0 overflow-hidden rounded-full border md:h-24 md:w-24">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={avatarUrl || ""}
                  alt={dictionary.avatar.label}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {initialData.firstName?.[0]}
                  {initialData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                className="bg-background/80 border-border hover:bg-background absolute right-1 bottom-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="hover:border-primary hover:text-primary"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {dictionary.avatar.upload}
                </Button>
                <p className="text-muted-foreground text-xs">
                  {dictionary.avatar.upload_hint}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {dictionary.avatar.presets}
                </p>
                <div className="flex flex-wrap gap-3">
                  {defaultAvatars.map((avatar) => (
                    <button
                      key={avatar.key}
                      type="button"
                      onClick={() => handlePresetSelect(avatar)}
                      disabled={isUploading}
                      className={cn(
                        "border-border focus:ring-primary focus:ring-offset-background relative h-12 w-12 overflow-hidden rounded-full border transition-all hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                        avatarUrl === avatar.url &&
                          "ring-primary ring-offset-background ring-2 ring-offset-2"
                      )}
                    >
                      <Image
                        src={avatar.url}
                        alt={dictionary.avatar.label}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.firstName}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={dictionary.firstNamePlaceholder}
                    />
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
                  <FormLabel>{dictionary.lastName}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={dictionary.lastNamePlaceholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone Field */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.phone.label}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      value={field.value || ""}
                      onChange={field.onChange}
                      labels={{
                        countrySelectorLabel:
                          dictionary.phone.countrySelectorLabel,
                        noResultsMessage: dictionary.phone.noResultsMessage,
                        searchPlaceholder: dictionary.phone.searchPlaceholder,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Teacher Fields */}
          {initialData.role === "TEACHER" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.teacher?.branch}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        disabled={isPending}
                        placeholder={dictionary.teacher?.branch_placeholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.teacher?.bio}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        disabled={isPending}
                        placeholder={dictionary.teacher?.bio_placeholder}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Student Fields */}
          {initialData.role === "STUDENT" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="studentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.student?.student_no}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                          placeholder={
                            dictionary.student?.student_no_placeholder
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.student?.grade_level}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                          placeholder={
                            dictionary.student?.grade_level_placeholder
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.student?.parent_name}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                          placeholder={
                            dictionary.student?.parent_name_placeholder
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.student?.parent_phone}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          value={field.value || ""}
                          onChange={field.onChange}
                          labels={{
                            countrySelectorLabel:
                              dictionary.phone.countrySelectorLabel,
                            noResultsMessage: dictionary.phone.noResultsMessage,
                            searchPlaceholder:
                              dictionary.phone.searchPlaceholder,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.student?.parent_email}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                          placeholder={
                            dictionary.student?.parent_email_placeholder
                          }
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-w-40 transition-all duration-200 md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary.saving}
                </>
              ) : (
                dictionary.save
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AvatarCropper
        imageSrc={selectedFileSrc}
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
        dictionary={dictionary.avatar}
      />
    </Card>
  );
}
