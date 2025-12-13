import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Merges Tailwind CSS classes with clsx.
 *
 * @param inputs - Class names or conditional class objects.
 * @returns A merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string | null | undefined) {
  if (!value) return "-";

  // Custom format for TR numbers to match user request: +90 (553) 667 29 10
  // Assuming value is E.164 like +905536672910
  const trRegex = /^(\+90)(\d{3})(\d{3})(\d{2})(\d{2})$/;
  if (trRegex.test(value)) {
    return value.replace(trRegex, "$1 ($2) $3 $4 $5");
  }

  // Fallback to standard intl format
  try {
    const parsed = parsePhoneNumberFromString(value);
    return parsed?.formatInternational() ?? value;
  } catch {
    return value;
  }
}

export function isDicebearUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "api.dicebear.com" ||
      parsed.hostname.endsWith(".dicebear.com")
    );
  } catch {
    return false;
  }
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export function getAvatarUrl(image: string | null | undefined, userId: string, version?: number) {
  if (!image) return "/api/avatars/default";
  if (image.startsWith("http") || image.startsWith("https")) {
    return image;
  }
  // Internal key
  return `/api/avatar/${userId}${version ? `?v=${version}` : ""}`;
}


export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
}
