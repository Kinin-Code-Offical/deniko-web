"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUsername } from "@/app/actions/user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UsernameFormProps {
  currentUsername: string;
  dictionary: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    button: string;
    success: string;
    error: string;
  };
  lang: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}

export function UsernameForm({
  currentUsername,
  dictionary,
  lang,
}: UsernameFormProps) {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await updateUsername(formData, lang);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(dictionary.success);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.description}</CardDescription>
      </CardHeader>
      <form action={clientAction}>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="username">{dictionary.label}</Label>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder={dictionary.placeholder}
              defaultValue={currentUsername}
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9._]+"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton label={dictionary.button} />
        </CardFooter>
      </form>
    </Card>
  );
}
