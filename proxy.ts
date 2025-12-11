import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n, type Locale } from "@/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import logger from "@/lib/logger";
import { env } from "@/lib/env";

const isProd = env.NODE_ENV === "production";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const attachSecurityHeaders = (response: NextResponse, pathname: string) => {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Canonical Header
  const canonicalUrl = `https://deniko.net${pathname}`;
  response.headers.set("Link", `<${canonicalUrl}>; rel="canonical"`);

  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
};

const syncLocaleCookie = (response: NextResponse, locale: string) => {
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    secure: isProd,
  });
};

const getClientIp = (request: NextRequest) =>
  (request as unknown as { ip?: string }).ip ??
  request.headers.get("x-forwarded-for") ??
  "unknown";

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;

  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  rateLimitBuckets.set(ip, bucket);
  return false;
};

function getLocale(request: NextRequest): string | undefined {
  // 1. Check cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  if (cookieLocale && i18n.locales.includes(cookieLocale as Locale)) {
    return cookieLocale;
  }

  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, locales, i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

export default function proxy(request: NextRequest) {
  const { nextUrl, method, headers, cookies, url } = request;
  const { pathname, search } = nextUrl;
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(request);

  // 1. Force HTTPS & WWW -> non-WWW Redirect
  const host = headers.get("host") || nextUrl.hostname;
  const proto =
    headers.get("x-forwarded-proto") || nextUrl.protocol.replace(":", "");

  if (host.startsWith("www.") || (isProd && proto === "http")) {
    const newHost = host.replace("www.", "");
    const newUrl = `https://${newHost}${pathname}${search}`;
    return NextResponse.redirect(new URL(newUrl), 301);
  }

  // Generate Nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Construct CSP Header
  // Note: 'strict-dynamic' allows scripts loaded by trusted scripts (like Next.js) to run.
  // We keep 'unsafe-inline' for backward compatibility (ignored by browsers supporting nonce).
  const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.googleusercontent.com https://storage.googleapis.com https://api.dicebear.com https://www.google-analytics.com;
        connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Set nonce in request headers for Next.js to use
  const requestHeaders = new Headers(headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  if (isRateLimited(clientIp)) {
    const limitedResponse = attachSecurityHeaders(
      NextResponse.json(
        {
          error: "too_many_requests",
          message: "Rate limit exceeded. Please slow down.",
        },
        { status: 429 }
      ),
      pathname
    );

    limitedResponse.headers.set("x-request-id", requestId);
    limitedResponse.headers.set(
      "Retry-After",
      String(RATE_LIMIT_WINDOW_MS / 1000)
    );
    limitedResponse.headers.set("Content-Security-Policy", cspHeader);
    return limitedResponse;
  }

  // Log Request
  logger.info({
    msg: "Incoming Request",
    requestId,
    method,
    url: pathname,
    ip: clientIp,
    userAgent: headers.get("user-agent"),
  });

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    const newUrl = new URL(
      `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
      url
    );

    if (isProd && proto === "http") {
      newUrl.protocol = "https:";
    }
    // Preserve query parameters
    newUrl.search = search;

    const response = attachSecurityHeaders(
      NextResponse.redirect(newUrl),
      pathname
    );

    response.headers.set("x-request-id", requestId);
    response.headers.set("Content-Security-Policy", cspHeader);

    if (locale && cookies.get("NEXT_LOCALE")?.value !== locale) {
      syncLocaleCookie(response, locale);
    }

    return response;
  } else {
    // If locale is present in path, ensure cookie matches
    const localeInPath = i18n.locales.find(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (localeInPath) {
      if (isProd && proto === "http") {
        const httpsUrl = new URL(url);
        httpsUrl.protocol = "https:";
        const secureResponse = attachSecurityHeaders(
          NextResponse.redirect(httpsUrl, 301),
          pathname
        );
        secureResponse.headers.set("x-request-id", requestId);
        secureResponse.headers.set("Content-Security-Policy", cspHeader);
        return secureResponse;
      }

      // Pass request headers (with nonce) to next()
      const response = attachSecurityHeaders(
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
        pathname
      );

      response.headers.set("x-request-id", requestId);
      response.headers.set("Content-Security-Policy", cspHeader);

      if (cookies.get("NEXT_LOCALE")?.value !== localeInPath) {
        syncLocaleCookie(response, localeInPath);
      }

      return response;
    }
    if (isProd && proto === "http") {
      const httpsUrl = new URL(url);
      httpsUrl.protocol = "https:";
      const secureFallback = attachSecurityHeaders(
        NextResponse.redirect(httpsUrl, 301),
        pathname
      );
      secureFallback.headers.set("x-request-id", requestId);
      secureFallback.headers.set("Content-Security-Policy", cspHeader);
      return secureFallback;
    }

    const fallbackResponse = attachSecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      pathname
    );

    fallbackResponse.headers.set("x-request-id", requestId);
    fallbackResponse.headers.set("Content-Security-Policy", cspHeader);
    return fallbackResponse;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
