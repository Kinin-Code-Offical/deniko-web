"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Trash2, UserMinus, Camera, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateStudentSettings,
  toggleInviteLink,
  unlinkStudent,
  deleteShadowStudent,
} from "@/app/actions/student";
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
} from "@/components/ui/alert-dialog";
import { ImageCropper } from "@/components/ui/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const DEFAULT_AVATARS = [
  "defaults/Felix.svg",
  "defaults/Aneka.svg",
  "defaults/Zoe.svg",
  "defaults/Jack.svg",
  "defaults/Precious.svg",
  "defaults/Sam.svg",
];

const createSettingsSchema = (lang: string) =>
  z.object({
    customName: z.string().optional(),

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    studentNo: z.string().optional(),
    gradeLevel: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return !val.startsWith("0");
        },
        {
          message:
            lang === "tr"
              ? "Telefon numarası 0 ile başlamamalıdır."
              : "Phone number must not start with 0.",
        }
      ),
    email: z.string().email().optional().or(z.literal("")),

    parentName: z.string().optional(),
    parentPhone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return !val.startsWith("0");
        },
        {
          message:
            lang === "tr"
              ? "Telefon numarası 0 ile başlamamalıdır."
              : "Phone number must not start with 0.",
        }
      ),
    parentEmail: z.string().email().optional().or(z.literal("")),
  });

import type { Dictionary } from "@/types/i18n";
import {
  type StudentTeacherRelation,
  type StudentProfile,
  type User,
} from "@prisma/client";

interface StudentSettingsTabProps {
  relation: StudentTeacherRelation & {
    student: StudentProfile & { user: User | null };
  };
  studentId: string;
  dictionary: Dictionary;
  lang: string;
}

export function StudentSettingsTab({
  relation: { student, customName },
  studentId,
  dictionary,
  lang,
}: StudentSettingsTabProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isClaimed } = student;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const settingsSchema = createSettingsSchema(lang);
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      customName: customName || "",
      firstName: student.tempFirstName || "",
      lastName: student.tempLastName || "",
      studentNo: student.studentNo || "",
      gradeLevel: student.gradeLevel || "",
      phone: student.tempPhone || "",
      email: student.tempEmail || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || "",
    },
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      // Append all fields
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (selectedAvatar) {
        formData.append("avatarUrl", selectedAvatar);
      }

      const result = await updateStudentSettings(studentId, formData);
      if (result.success) {
        toast.success(
          dictionary.student_detail.settings.success ||
            (lang === "tr" ? "Ayarlar kaydedildi" : "Settings saved")
        );
        router.refresh();
      } else {
        toast.error(
          result.error ||
            (lang === "tr" ? "Bir hata oluştu" : "An error occurred")
        );
      }
    });
  }

  const handleToggleInvite = async (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleInviteLink(studentId, checked);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUnlink = async () => {
    const result = await unlinkStudent(studentId);
    if (result.success) {
      toast.success(dictionary.student_detail.settings.archive.success);
      router.push("/dashboard/students");
    } else {
      toast.error(result.error || "Hata oluştu");
    }
  };

  const handleDelete = async () => {
    const result = await deleteShadowStudent(studentId);
    if (result.success) {
      toast.success(dictionary.student_detail.settings.delete.success);
      router.push("/dashboard/students");
    } else {
      toast.error(result.error || "Hata oluştu");
    }
  };

  // Avatar logic
  const currentAvatar =
    avatarPreview ||
    (selectedAvatar
      ? selectedAvatar.startsWith("http")
        ? selectedAvatar
        : `/api/files/${selectedAvatar}`
      : student.isClaimed && student.user?.image
        ? student.user.image
        : student.tempAvatar
          ? student.tempAvatar.startsWith("http")
            ? student.tempAvatar.includes("dicebear.com")
              ? `/api/files/defaults/${new URL(student.tempAvatar).searchParams.get("seed")}.svg`
              : student.tempAvatar
            : `/api/files/${student.tempAvatar}`
          : undefined);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.student_detail.settings.title}</CardTitle>
          <CardDescription>
            {dictionary.student_detail.settings.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={currentAvatar}
                      alt={dictionary.common.avatar || "Avatar"}
                    />
                    <AvatarFallback>
                      {dictionary.common.student_initials || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="text-primary flex items-center gap-2 text-sm font-medium hover:underline">
                        <Camera className="h-4 w-4" />
                        {dictionary.student_detail.settings.change_photo ||
                          "Fotoğrafı Değiştir"}
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTempFile(file);
                            setShowCropper(true);
                            e.target.value = "";
                          }
                        }}
                        disabled={isClaimed}
                      />
                    </Label>
                    {isClaimed && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {dictionary.student_detail.settings.photo_claimed_desc}
                      </p>
                    )}
                  </div>
                </div>

                {!isClaimed && (
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
                          setAvatarPreview(null);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            avatar.startsWith("http")
                              ? avatar
                              : `/api/files/${avatar}`
                          }
                          alt={dictionary.common.avatar || "Avatar"}
                          className="h-10 w-10 rounded-full"
                        />
                        {selectedAvatar === avatar && (
                          <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.settings.custom_name ||
                          "Görünen İsim (Takma Ad)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            dictionary.student_detail.settings
                              .name_placeholder || "..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.settings.student_number ||
                          "Öğrenci Numarası"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            dictionary.student_detail.settings
                              .student_no_placeholder || "..."
                          }
                          {...field}
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
                      <FormLabel>
                        {dictionary.student_detail.settings.grade_level ||
                          "Sınıf Seviyesi"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            dictionary.student_detail.settings
                              .grade_placeholder || "..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Real Name (Shadow Only) */}
              {!isClaimed && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {dictionary.student_detail.settings.real_first_name}
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {dictionary.student_detail.settings.real_last_name}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.settings.phone}
                      </FormLabel>
                      <FormControl>
                        {isClaimed ? (
                          <Input
                            {...field}
                            disabled
                            value={student.user?.phoneNumber || ""}
                          />
                        ) : (
                          <PhoneInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            international={true}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.settings.email || "E-posta"}
                      </FormLabel>
                      <FormControl>
                        {isClaimed ? (
                          <Input
                            {...field}
                            disabled
                            value={student.user?.email || ""}
                          />
                        ) : (
                          <Input {...field} type="email" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <h3 className="text-lg font-medium">
                {dictionary.student_detail.overview.parent_info}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.overview.parent_name}
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
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dictionary.student_detail.overview.parent_phone}
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          international={true}
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
                      <FormLabel>
                        {dictionary.student_detail.overview.parent_email}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {dictionary.student_detail.settings.save_changes || "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Invite Link Toggle */}
      {!isClaimed && (
        <Card>
          <CardHeader>
            <CardTitle>
              {dictionary.student_detail.settings.invite_link}
            </CardTitle>
            <CardDescription>
              {dictionary.student_detail.settings.invite_link_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>
                {dictionary.student_detail.settings.invite_link_status}
              </Label>
              <p className="text-muted-foreground text-sm">
                {student.inviteToken
                  ? dictionary.student_detail.settings.invite_link_active
                  : dictionary.student_detail.settings.invite_link_inactive}
              </p>
            </div>
            <Switch
              checked={!!student.inviteToken}
              onCheckedChange={handleToggleInvite}
              disabled={isPending}
              aria-label={dictionary.student_detail.settings.invite_link_status}
            />
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            {dictionary.student_detail.settings.danger_zone}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">
                {dictionary.student_detail.settings.archive.title}
              </div>
              <div className="text-muted-foreground text-sm">
                {dictionary.student_detail.settings.archive.desc}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  {dictionary.student_detail.settings.archive.button}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {dictionary.student_detail.settings.archive.confirm_title}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {dictionary.student_detail.settings.archive.confirm_desc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {dictionary.common.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUnlink}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {dictionary.common.continue}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {!isClaimed && (
            <div className="border-destructive/50 bg-destructive/5 flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-destructive font-medium">
                  {dictionary.student_detail.settings.delete.title}
                </div>
                <div className="text-destructive/80 text-sm">
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
                    <AlertDialogTitle>
                      {dictionary.student_detail.settings.delete.confirm_title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {dictionary.student_detail.settings.delete.confirm_desc}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {dictionary.common.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {dictionary.student_detail.settings.delete.button}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      <ImageCropper
        open={showCropper}
        onOpenChange={setShowCropper}
        file={tempFile}
        onCrop={(croppedFile) => {
          setSelectedFile(croppedFile);
          setAvatarPreview(URL.createObjectURL(croppedFile));
          setSelectedAvatar(null);
        }}
        saveLabel={dictionary.student_detail.settings.save_changes || "Kaydet"}
        zoomLabel={dictionary.common.zoom}
        cropPreviewAlt={dictionary.common.crop_preview}
      />
    </div>
  );
}
