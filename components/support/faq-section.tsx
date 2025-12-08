"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Dictionary } from "@/types/i18n";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQSectionProps {
  dictionary: Dictionary;
}

export function FAQSection({ dictionary }: FAQSectionProps) {
  const { faq } = dictionary.support;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12">
      {/* Search Bar */}
      <div className="relative mx-auto max-w-lg">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder={dictionary.support.hero.search_placeholder}
            className="h-12 rounded-full border-slate-200 bg-white pl-12 text-base shadow-lg shadow-slate-200/50 transition-all focus-visible:ring-2 focus-visible:ring-[#2062A3] focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none"
          />
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-muted/50 inline-flex h-auto flex-wrap justify-center gap-2 rounded-full p-1.5">
            <TabsTrigger
              value="general"
              className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2062A3] data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-blue-400"
            >
              {faq.categories.general}
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2062A3] data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-blue-400"
            >
              {faq.categories.billing}
            </TabsTrigger>
            <TabsTrigger
              value="teachers"
              className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2062A3] data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-blue-400"
            >
              {faq.categories.teachers}
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2062A3] data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-blue-400"
            >
              {faq.categories.students}
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(faq.items).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid gap-4">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-border/50 overflow-hidden rounded-xl border bg-white px-2 shadow-sm transition-all hover:border-[#2062A3]/30 hover:shadow-md dark:bg-slate-950 dark:hover:border-blue-400/30"
                  >
                    <AccordionTrigger className="px-4 py-4 text-left text-base font-medium transition-colors hover:text-[#2062A3] hover:no-underline dark:hover:text-blue-400">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground px-4 pb-4 text-base leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
