"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { updateRegionTimezonePreferencesAction } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Globe } from "lucide-react";

const regionSchema = z.object({
  country: z.string().min(1),
  timezone: z.string().min(1),
});

interface RegionDictionary {
  title: string;
  description: string;
  country: { label: string; placeholder: string };
  timezone: { label: string; placeholder: string };
  save: string;
  success: string;
  saving: string;
}

interface RegionFormProps {
  initialData: {
    country: string;
    timezone: string;
  };
  dictionary: RegionDictionary;
  lang: string;
}

export function RegionForm({ initialData, dictionary, lang }: RegionFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof regionSchema>>({
    resolver: zodResolver(regionSchema),
    defaultValues: initialData,
  });

  function onSubmit(data: z.infer<typeof regionSchema>) {
    startTransition(async () => {
      const result = await updateRegionTimezonePreferencesAction(data, lang);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(dictionary.success);
      }
    });
  }

  // Get timezones with GMT offset
  const timezones = Intl.supportedValuesOf("timeZone").map((tz) => {
    try {
      const offset = new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "shortOffset", // ignore-hardcoded
      })
        .formatToParts()
        .find((part) => part.type === "timeZoneName")?.value; // ignore-hardcoded
      return { value: tz, label: `${tz} (${offset})` };
    } catch {
      return { value: tz, label: tz };
    }
  });

  // Get countries (using react-phone-number-input's locale data if possible, or just codes)
  // We'll use a simple list of codes for now, or try to map them.
  // Since we don't have a full country list library installed explicitly besides phone input,
  // we can use the keys from the locale json if we import it, or just use codes.
  // Let's use a few common ones for demonstration if we can't easily get names.
  // Actually, let's try to use `Intl.DisplayNames` for country names.
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countries = [
    "TR",
    "US",
    "GB",
    "DE",
    "FR",
    "ES",
    "IT",
    "NL",
    "RU",
    "CN",
    "JP",
    "KR",
    "IN",
    "BR",
    "CA",
    "AU",
    "MX",
    "ID",
    "SA",
    "ZA",
    "AR",
    "EG",
    "NG",
    "PK",
    "BD",
    "VN",
    "PH",
    "TH",
    "MY",
    "SG",
    "UA",
    "PL",
    "SE",
    "NO",
    "FI",
    "DK",
    "IE",
    "PT",
    "GR",
    "CZ",
    "HU",
    "RO",
    "BG",
    "HR",
    "RS",
    "SI",
    "SK",
    "AT",
    "CH",
    "BE",
    "LU",
    "NZ",
    "IL",
    "AE",
    "QA",
    "KW",
    "OM",
    "BH",
    "LB",
    "JO",
    "MA",
    "DZ",
    "TN",
  ].sort();

  return (
    <Card className="border-border bg-card dark:border-primary/10 dark:shadow-primary/5 space-y-6 rounded-2xl border p-4 transition-all duration-300 md:p-6 dark:shadow-lg">
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg leading-none font-semibold tracking-tight">
          <Globe className="text-primary h-5 w-5" />
          {dictionary.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.country.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={dictionary.country.placeholder}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((code) => (
                        <SelectItem key={code} value={code}>
                          {regionNames.of(code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.timezone.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={dictionary.timezone.placeholder}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-w-40 transition-all duration-200 md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary.saving}
                </>
              ) : (
                dictionary.save
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
