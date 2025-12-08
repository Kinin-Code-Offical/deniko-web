"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitSupportTicket, type SupportState } from "@/app/actions/support";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface SupportFormProps {
  dictionary: Dictionary;
}

export function SupportForm({ dictionary }: SupportFormProps) {
  const d = dictionary.support.contact.form;
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = useState<SupportState>({});

  const formSchema = z.object({
    name: z.string().min(2, { message: d.validation.name_required }),
    email: z.string().email({ message: d.validation.email_invalid }),
    subject: z.string().min(5, { message: d.validation.subject_min }),
    type: z.enum(["general", "bug", "billing", "feature"]),
    message: z.string().min(10, { message: d.validation.message_min }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      type: "general",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("subject", values.subject);
      formData.append("type", values.type);
      formData.append("message", values.message);

      const result = await submitSupportTicket({}, formData);
      setState(result);

      if (result.success) {
        toast.success(d.success_title, {
          description: d.success_description.replace(
            "{ticketId}",
            result.ticketId || ""
          ),
        });
        form.reset();
      } else {
        toast.error(d.error_title, {
          description: result.message || d.error_description,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{d.name}</FormLabel>
                <FormControl>
                  <Input placeholder={d.name_placeholder} {...field} />
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
                <FormLabel>{d.email}</FormLabel>
                <FormControl>
                  <Input placeholder={d.email_placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{d.type_label}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={d.type_placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">{d.types.general}</SelectItem>
                  <SelectItem value="bug">{d.types.bug}</SelectItem>
                  <SelectItem value="billing">{d.types.billing}</SelectItem>
                  <SelectItem value="feature">{d.types.feature}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{d.subject}</FormLabel>
              <FormControl>
                <Input placeholder={d.subject_placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{d.message}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={d.message_placeholder}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {d.submitting}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {d.submit}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
