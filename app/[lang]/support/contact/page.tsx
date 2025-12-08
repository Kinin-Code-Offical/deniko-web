import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { SupportForm } from "@/components/support/support-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const { contact } = dictionary.support;

  return (
    <div className="container max-w-5xl py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Info Side */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              {contact.title}
            </h1>
            <p className="text-muted-foreground text-xl">{contact.subtitle}</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 rounded-full p-3">
                  <Mail className="text-primary h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {contact.info.email_label}
                  </CardTitle>
                  <CardDescription>{contact.info.email}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 rounded-full p-3">
                  <MessageSquare className="text-primary h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {contact.info.chat_label}
                  </CardTitle>
                  <CardDescription>{contact.info.chat_desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 rounded-full p-3">
                  <Phone className="text-primary h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {contact.info.phone_label}
                  </CardTitle>
                  <CardDescription>{contact.info.phone_desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <SupportForm dictionary={dictionary} />
        </div>
      </div>
    </div>
  );
}
