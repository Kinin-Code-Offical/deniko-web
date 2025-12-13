"use client";

import { useState, useRef } from "react";
import { AvatarCropper } from "@/components/ui/avatar-cropper";
import { uploadAvatarAction } from "@/app/actions/upload";
import { updateAvatarAction } from "@/app/actions/settings";
import { toast } from "sonner";

import type { Dictionary } from "@/types/i18n";

interface AvatarUploadDialogProps {
  children: React.ReactNode;
  currentAvatarUrl: string;
  onAvatarUpdate: () => void;
  dictionary: Dictionary;
  lang: string;
}

export function AvatarUploadDialog({
  children,
  onAvatarUpdate,
  dictionary,
  lang,
}: AvatarUploadDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(dictionary.profile.settings.basic.avatar.error_file_size);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(dictionary.profile.settings.basic.avatar.error_file_type);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "avatar.jpg");

      const uploadResult = await uploadAvatarAction(formData, lang);
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      const updateResult = await updateAvatarAction(uploadResult.url, lang);
      if (updateResult.error) {
        throw new Error(updateResult.error);
      }

      toast.success(dictionary.profile.settings.basic.avatar.success_update);
      setPreviewUrl(null);
      onAvatarUpdate();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      toast.error(dictionary.profile.settings.basic.avatar.error_upload);
    }
  };

  return (
    <>
      <div onClick={() => fileInputRef.current?.click()}>{children}</div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
      {previewUrl && (
        <AvatarCropper
          open={!!previewUrl}
          onOpenChange={(open) => !open && setPreviewUrl(null)}
          imageSrc={previewUrl}
          onCropComplete={handleCropComplete}
          dictionary={{
            crop_title: dictionary.common.edit_photo,
            crop_desc: dictionary.common.crop_description,
            cancel: dictionary.common.cancel || "Cancel",
            save: dictionary.common.save || "Save",
          }}
        />
      )}
    </>
  );
}
