"use client";

import * as React from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if cookie_consent cookie exists
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="));

    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set cookie for 1 year
    document.cookie =
      "cookie_consent=true; path=/; max-age=31536000; SameSite=Lax";
    window.dispatchEvent(new Event("cookie-consent"));
    setIsVisible(false);
  };

  const declineCookies = () => {
    // Set cookie for session only (or maybe a shorter time to ask again later, but user said "Decline" sets it to false)
    // User requirement: "On 'Decline', set cookie_consent=false and hide."
    document.cookie =
      "cookie_consent=false; path=/; max-age=31536000; SameSite=Lax";
    window.dispatchEvent(new Event("cookie-consent"));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="animate-slide-up-fade fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:p-6">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-1 items-start gap-4 md:items-center">
          <div className="hidden shrink-0 rounded-full bg-blue-50 p-2 md:block">
            <Cookie className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 md:hidden">
              <Cookie className="h-4 w-4 text-blue-600" />
              Çerez Tercihleri
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Deniko olarak deneyiminizi iyileştirmek, analitik veriler toplamak
              ve size özel içerikler sunmak için çerezler kullanıyoruz. Detaylı
              bilgi için{" "}
              <Link
                href="/tr/legal/cookies"
                className="font-medium text-blue-600 hover:underline"
              >
                Çerez Politikası
              </Link>
              &apos;nı inceleyebilirsiniz.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Button
            variant="outline"
            onClick={declineCookies}
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 md:flex-none"
          >
            Reddet
          </Button>
          <Button
            onClick={acceptCookies}
            className="flex-1 bg-blue-600 text-white shadow-sm hover:bg-blue-700 md:flex-none"
          >
            Kabul Et
          </Button>
        </div>
      </div>
    </div>
  );
}
