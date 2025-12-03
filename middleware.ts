import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import logger from '@/lib/logger'

function getLocale(request: NextRequest): string | undefined {
    // 1. Check cookie
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
        return cookieLocale
    }

    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    // @ts-expect-error locales are readonly
    const locales: string[] = i18n.locales
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    try {
        return matchLocale(languages, locales, i18n.defaultLocale)
    } catch {
        return i18n.defaultLocale
    }
}

export default function proxy(request: NextRequest) {
    const requestId = crypto.randomUUID()
    const pathname = request.nextUrl.pathname

    // Log Request
    logger.info({
        msg: "Incoming Request",
        requestId,
        method: request.method,
        url: pathname,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ip: (request as any).ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
    })

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // e.g. incoming request is /products
        // The new URL is now /en-US/products
        const newUrl = new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            request.url
        )

        // Preserve query parameters
        newUrl.search = request.nextUrl.search

        const response = NextResponse.redirect(newUrl)

        // Add Request ID
        response.headers.set('x-request-id', requestId)

        // Set cookie if missing or different
        if (request.cookies.get("NEXT_LOCALE")?.value !== locale) {
            response.cookies.set("NEXT_LOCALE", locale as string, { path: '/', maxAge: 31536000, sameSite: 'lax' })
        }

        return response
    } else {
        // If locale is present in path, ensure cookie matches
        const localeInPath = i18n.locales.find(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        )

        if (localeInPath) {
            const response = NextResponse.next()

            // Add Request ID
            response.headers.set('x-request-id', requestId)

            if (request.cookies.get("NEXT_LOCALE")?.value !== localeInPath) {
                response.cookies.set("NEXT_LOCALE", localeInPath, { path: '/', maxAge: 31536000, sameSite: 'lax' })
            }
            return response
        }
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
