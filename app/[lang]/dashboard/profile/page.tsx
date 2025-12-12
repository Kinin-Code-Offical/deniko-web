import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {dictionary.dashboard.profile.title}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.profile.personal_info}</CardTitle>
            <CardDescription>
              {dictionary.dashboard.profile.personal_info_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <Button variant="outline">
                {dictionary.dashboard.profile.change_avatar}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="name">
                {dictionary.dashboard.profile.full_name}
              </Label>
              <Input id="name" defaultValue={user?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                {dictionary.dashboard.profile.email}
              </Label>
              <Input id="email" defaultValue={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{dictionary.dashboard.profile.role}</Label>
              <Input id="role" defaultValue={user?.role || ""} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.profile.contact_info}</CardTitle>
            <CardDescription>
              {dictionary.dashboard.profile.contact_info_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {dictionary.dashboard.profile.phone}
              </Label>
              <Input
                id="phone"
                placeholder={dictionary.dashboard.profile.phone_placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                {dictionary.dashboard.profile.address}
              </Label>
              <Input
                id="address"
                placeholder={dictionary.dashboard.profile.address_placeholder}
              />
            </div>
            <div className="pt-4">
              <Button>{dictionary.dashboard.profile.save_changes}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
