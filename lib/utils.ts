import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parsePhoneNumberFromString } from "libphonenumber-js"

/**
 * Merges Tailwind CSS classes with clsx.
 * 
 * @param inputs - Class names or conditional class objects.
 * @returns A merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string | null | undefined) {
  if (!value) return "-"

  // Custom format for TR numbers to match user request: +90 (553) 667 29 10
  // Assuming value is E.164 like +905536672910
  const trRegex = /^(\+90)(\d{3})(\d{3})(\d{2})(\d{2})$/
  if (trRegex.test(value)) {
    return value.replace(trRegex, '$1 ($2) $3 $4 $5')
  }

  // Fallback to standard intl format
  try {
    const parsed = parsePhoneNumberFromString(value)
    return parsed?.formatInternational() ?? value
  } catch {
    return value
  }
}
