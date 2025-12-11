"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Share2,
  RefreshCw,
  MessageCircle,
  Smartphone,
  Link as LinkIcon,
} from "lucide-react";
import useCopyToClipboard from "@/lib/hooks/useCopyToClipboard";
import { toast } from "sonner";
import type { Dictionary } from "@/types/i18n";
import { useTimeout } from "@/lib/hooks/use-timeout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type InviteButtonProps = {
  token: string | null;
  lang: string;
  dictionary: Dictionary;
};

export function InviteButton({ token, lang, dictionary }: InviteButtonProps) {
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useTimeout(() => setIsCopied(false), isCopied ? 2000 : null);

  const inviteLink = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/join/${token}`
    : "";

  const onCopy = () => {
    if (!inviteLink) return;
    copy(inviteLink)
      .then(() => {
        setIsCopied(true);
        toast.success(dictionary.student_detail.settings.link_copied);
      })
      .catch((error) => {
        toast.error(dictionary.student_detail.settings.error_message);
        console.error("Failed to copy invite link: ", error); // ignore-console-check
      });
  };

  const onShare = async (platform?: string) => {
    if (!inviteLink) return;

    const text = `${dictionary.join.desc} ${inviteLink}`;

    if (navigator.share && !platform) {
      try {
        await navigator.share({
          title: dictionary.join.title,
          text: text,
          url: inviteLink,
        });
      } catch (err) {
        console.error("Share failed:", err); // ignore-console-check
      }
      return;
    }

    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case "sms":
        url = `sms:?body=${encodeURIComponent(text)}`;
        break;
      default:
        onCopy();
        return;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {dictionary.dashboard.students.actions.view_invite_link}
          </span>
          <span className="sm:hidden">
            {dictionary.dashboard.students.actions.copy_invite}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dictionary.dashboard.students.actions.view_invite_link}
          </DialogTitle>
          <DialogDescription>
            {dictionary.student_detail.settings.invite_link_desc}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              defaultValue={inviteLink}
              readOnly
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={onCopy}>
            <span className="sr-only">
              {dictionary.student_detail.settings.copy_link}
            </span>
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onShare("whatsapp")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {dictionary.dashboard.students.actions.whatsapp}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onShare("sms")}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            {dictionary.dashboard.students.actions.sms}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onShare()}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {dictionary.dashboard.students.actions.share}
          </Button>
        </div>
        <div className="mt-4 flex justify-center border-t pt-4 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            disabled
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            {dictionary.dashboard.students.actions.regenerate_link} (
            {dictionary.dashboard.students.actions.coming_soon})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
