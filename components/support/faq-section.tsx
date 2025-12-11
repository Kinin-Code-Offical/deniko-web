"use client";

import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Dictionary } from "@/types/i18n";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FAQSectionProps {
  dictionary: Dictionary;
}

export function FAQSection({ dictionary }: FAQSectionProps) {
  const { faq } = dictionary.support;
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "general", label: faq.categories.general },
    { id: "billing", label: faq.categories.billing },
    { id: "teachers", label: faq.categories.teachers },
    { id: "students", label: faq.categories.students },
  ];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return faq.items[activeCategory as keyof typeof faq.items] || [];
    }

    const query = searchQuery.toLowerCase();
    const allItems = Object.values(faq.items).flat();

    return allItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, faq, activeCategory]);

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[280px_minmax(0,60vw)]">
      {/* Left Column: Categories & Search */}
      <div className="space-y-6 self-start lg:sticky lg:top-24">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder={dictionary.support.hero.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-blue-500"
          />
        </div>

        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="bg-slate-50/50 pb-4 dark:bg-slate-900/50">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {dictionary.support.faq.title}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {dictionary.support.hero.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="flex flex-col space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery(""); // Clear search when changing category
                  }}
                  className={cn(
                    "justify-start rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    activeCategory === category.id && !searchQuery
                      ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: FAQ Content */}
      <div className="mx-auto w-[90vw] max-w-full space-y-6 lg:mx-0 lg:w-full">
        <div className="dnk-scrollbar h-[75vh] min-h-[500px] w-full overflow-y-auto pr-2">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <AccordionItem
                  key={`${activeCategory}-${index}`}
                  value={`item-${index}`}
                  className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-800 dark:hover:bg-slate-900"
                >
                  <AccordionTrigger className="w-full px-6 py-5 text-left text-base font-medium text-slate-900 transition-colors hover:text-blue-600 hover:no-underline dark:text-slate-200 dark:hover:text-blue-400">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center dark:border-slate-800 dark:bg-slate-900/30">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {dictionary.support.faq.no_results}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {dictionary.support.faq.no_results_desc}
                </p>
              </div>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
