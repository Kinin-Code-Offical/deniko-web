"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deactivateAccountAction,
  deleteAccountAction,
} from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Trash2, PauseCircle } from "lucide-react";
import { signOut } from "next-auth/react";

interface DangerZoneDictionary {
  deactivate: {
    title: string;
    description: string;
    button: string;
    confirmTitle: string;
    confirmDescription: string;
    cancel: string;
    confirmButton: string;
    success: string;
    processing: string;
  };
  delete: {
    title: string;
    description: string;
    button: string;
    confirmTitle: string;
    confirmDescription: string;
    cancel: string;
    confirmButton: string;
    success: string;
    typeToConfirm: string;
    deleting: string;
  };
}

interface DangerZoneProps {
  dictionary: DangerZoneDictionary;
  lang: string;
}

export function DangerZone({ dictionary, lang }: DangerZoneProps) {
  return (
    <div className="space-y-6">
      <DeactivateAccount dictionary={dictionary.deactivate} lang={lang} />
      <DeleteAccount dictionary={dictionary.delete} lang={lang} />
    </div>
  );
}

function DeactivateAccount({
  dictionary,
  lang,
}: {
  dictionary: DangerZoneDictionary["deactivate"];
  lang: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function onConfirm() {
    startTransition(async () => {
      const result = await deactivateAccountAction(lang);
      if (result.error) {
        toast.error(result.error);
        setIsOpen(false);
      } else {
        toast.success(dictionary.success);
        // Sign out after deactivation
        await signOut({ callbackUrl: "/" });
      }
    });
  }

  return (
    <Card className="space-y-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 transition-all duration-300 md:p-6 dark:shadow-lg dark:shadow-yellow-500/5">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight text-yellow-600 dark:text-yellow-500">
          <PauseCircle className="h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full min-w-40 border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-600 md:w-auto dark:hover:text-yellow-500"
            >
              {dictionary.button}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dictionary.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {dictionary.confirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{dictionary.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                disabled={isPending}
                className="bg-yellow-600 transition-all duration-200 hover:bg-yellow-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {dictionary.processing}
                  </>
                ) : (
                  dictionary.confirmButton
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

function DeleteAccount({
  dictionary,
  lang,
}: {
  dictionary: DangerZoneDictionary["delete"];
  lang: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const CONFIRMATION_KEYWORD = "DELETE";
  const KEYWORD_PLACEHOLDER = "{keyword}";

  function onConfirm() {
    if (confirmText !== CONFIRMATION_KEYWORD) return;

    startTransition(async () => {
      const result = await deleteAccountAction(lang);
      if (result.error) {
        toast.error(result.error);
        setIsOpen(false);
      } else {
        toast.success(dictionary.success);
        await signOut({ callbackUrl: "/" });
      }
    });
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 dark:shadow-destructive/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="text-destructive flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Trash2 className="h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full min-w-40 md:w-auto">
              {dictionary.button}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dictionary.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {dictionary.confirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="confirm-delete" className="mb-2 block">
                <span
                  dangerouslySetInnerHTML={{
                    __html: dictionary.typeToConfirm.replace(
                      KEYWORD_PLACEHOLDER,
                      `<strong>${CONFIRMATION_KEYWORD}</strong>`
                    ),
                  }}
                />
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRMATION_KEYWORD}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>
                {dictionary.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                disabled={isPending || confirmText !== CONFIRMATION_KEYWORD}
                className="bg-destructive hover:bg-destructive/90 transition-all duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {dictionary.deleting}
                  </>
                ) : (
                  dictionary.confirmButton
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
