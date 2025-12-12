"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfilePrivacyAction } from "@/app/actions/privacy";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PrivacySettings {
  isProfilePublic: boolean;
  showAvatarOnProfile: boolean;
  showEmailOnProfile: boolean;
  showPhoneOnProfile: boolean;
  allowMessagesFromUsers: boolean;
}

interface PrivacyFormProps {
  initialSettings: PrivacySettings;
  lang: string;
  dictionary: {
    title: string;
    description: string;
    profileVisibility: { label: string; description: string };
    avatar: { label: string; description: string };
    email: { label: string; description: string };
    phone: { label: string; description: string };
    messages: { label: string; description: string };
    saveSuccess: string;
    saveError: string;
  };
}

export function PrivacyForm({
  initialSettings,
  dictionary,
  lang,
}: PrivacyFormProps) {
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };

    // Optimistic update
    setSettings(newSettings);
    setIsLoading(true);

    try {
      const result = await updateProfilePrivacyAction(newSettings, lang);
      if (result.error) {
        setSettings(settings); // Revert
        toast.error(dictionary.saveError);
      } else {
        toast.success(dictionary.saveSuccess);
        // If isProfilePublic was turned off, the server might have forced other fields to false.
        // In a real app we might want to re-fetch or return the updated state from the action.
        // For now, we'll assume the server logic matches our optimistic update if we were to implement the same logic here.
        if (key === "isProfilePublic" && !value) {
          setSettings({
            isProfilePublic: false,
            showAvatarOnProfile: false,
            showEmailOnProfile: false,
            showPhoneOnProfile: false,
            allowMessagesFromUsers: false,
          });
        }
      }
    } catch {
      setSettings(settings); // Revert
      toast.error(dictionary.saveError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {dictionary.title}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>{dictionary.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="isProfilePublic">
              {dictionary.profileVisibility.label}
            </Label>
            <p className="text-muted-foreground text-sm">
              {dictionary.profileVisibility.description}
            </p>
          </div>
          <Switch
            id="isProfilePublic"
            checked={settings.isProfilePublic}
            onCheckedChange={(checked) =>
              handleToggle("isProfilePublic", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="showAvatarOnProfile">
              {dictionary.avatar.label}
            </Label>
            <p className="text-muted-foreground text-sm">
              {dictionary.avatar.description}
            </p>
          </div>
          <Switch
            id="showAvatarOnProfile"
            checked={settings.showAvatarOnProfile}
            disabled={!settings.isProfilePublic}
            onCheckedChange={(checked) =>
              handleToggle("showAvatarOnProfile", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="showEmailOnProfile">{dictionary.email.label}</Label>
            <p className="text-muted-foreground text-sm">
              {dictionary.email.description}
            </p>
          </div>
          <Switch
            id="showEmailOnProfile"
            checked={settings.showEmailOnProfile}
            disabled={!settings.isProfilePublic}
            onCheckedChange={(checked) =>
              handleToggle("showEmailOnProfile", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="showPhoneOnProfile">{dictionary.phone.label}</Label>
            <p className="text-muted-foreground text-sm">
              {dictionary.phone.description}
            </p>
          </div>
          <Switch
            id="showPhoneOnProfile"
            checked={settings.showPhoneOnProfile}
            disabled={!settings.isProfilePublic}
            onCheckedChange={(checked) =>
              handleToggle("showPhoneOnProfile", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="allowMessagesFromUsers">
              {dictionary.messages.label}
            </Label>
            <p className="text-muted-foreground text-sm">
              {dictionary.messages.description}
            </p>
          </div>
          <Switch
            id="allowMessagesFromUsers"
            checked={settings.allowMessagesFromUsers}
            disabled={!settings.isProfilePublic}
            onCheckedChange={(checked) =>
              handleToggle("allowMessagesFromUsers", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
