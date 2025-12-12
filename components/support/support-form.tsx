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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Send } from "lucide-react";
import type { Dictionary } from "@/types/i18n";
import { cn } from "@/lib/utils";

interface SupportFormProps {
  dictionary: Dictionary;
}

export function SupportForm({ dictionary }: SupportFormProps) {
  const d = dictionary.support.contact.form;
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = useState<SupportState>({});
  const [open, setOpen] = useState(false);

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
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300">
                  {d.name}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={d.name_placeholder}
                    {...field}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  />
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
                <FormLabel className="text-slate-700 dark:text-slate-300">
                  {d.email}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={d.email_placeholder}
                    {...field}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  />
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
              <FormLabel className="text-slate-700 dark:text-slate-300">
                {d.type_label}
              </FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between font-normal",
                        "h-11 rounded-xl border-slate-200 bg-slate-50 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? d.types[field.value as keyof typeof d.types]
                        : d.type_placeholder}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[280px] rounded-xl border-slate-200 p-0 dark:border-slate-800 dark:bg-slate-950"
                  align="start"
                >
                  <div className="p-1">
                    {(["general", "bug", "billing", "feature"] as const).map(
                      (type) => (
                        <div
                          key={type}
                          className={cn(
                            "relative flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm transition-colors outline-none select-none hover:bg-slate-100 dark:hover:bg-slate-800",
                            field.value === type &&
                              "bg-slate-100 font-medium dark:bg-slate-800"
                          )}
                          onClick={() => {
                            field.onChange(type);
                            setOpen(false);
                          }}
                        >
                          {d.types[type]}
                          {field.value === type && (
                            <Check className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300">
                {d.subject}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={d.subject_placeholder}
                  {...field}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
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
              <FormLabel className="text-slate-700 dark:text-slate-300">
                {d.message}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={d.message_placeholder}
                  className="min-h-[150px] resize-none rounded-xl border-slate-200 bg-slate-50 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-blue-600 text-base font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 dark:bg-blue-600 dark:hover:bg-blue-500"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {d.submitting}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {d.submit}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
