"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/types/i18n";

interface NewsletterSignupProps {
  dictionary: Dictionary;
}

export function NewsletterSignup({ dictionary }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    if (email) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="rounded-2xl bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          {dictionary.newsletter.title}
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {dictionary.newsletter.description}
        </p>

        {status === "success" ? (
          <div className="rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {dictionary.newsletter.success}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {dictionary.newsletter.placeholder}
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder={dictionary.newsletter.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit">{dictionary.newsletter.button}</Button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {dictionary.newsletter.error}
          </p>
        )}
      </div>
    </section>
  );
}
