import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "loading" | "priority"> {
  /**
   * If true, the image will be treated as a Hero image:
   * - Preloaded (priority=true)
   * - Eager loading
   * - No lazy loading
   * Use this for images above the fold (LCP candidates).
   */
  isHero?: boolean;
}

export function OptimizedImage({
  className,
  isHero = false,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      className={cn("transition-opacity duration-300", className)}
      loading={isHero ? undefined : "lazy"}
      priority={isHero}
      alt={alt} // Ensure alt is passed explicitly for strict typing if needed, though ...props covers it
      {...props}
    />
  );
}
