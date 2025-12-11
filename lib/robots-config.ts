import type { Metadata } from "next";
import { env } from "@/lib/env";

/**
 * Generates robots metadata based on the NEXT_PUBLIC_NOINDEX environment variable.
 * If NEXT_PUBLIC_NOINDEX is true, it returns 'noindex, nofollow'.
 * Otherwise, it returns the provided default or 'index, follow'.
 *
 * @param defaultRobots - Optional default robots setting (e.g., for specific pages that should always be noindex)
 */
export function generateRobotsMetadata(
  defaultRobots?: Metadata["robots"]
): Metadata["robots"] {
  if (env.NEXT_PUBLIC_NOINDEX) {
    return {
      index: false,
      follow: false,
    };
  }

  return (
    defaultRobots || {
      index: true,
      follow: true,
    }
  );
}
