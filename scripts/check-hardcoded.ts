import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { fileURLToPath } from "url";

interface Issue {
  file: string;
  line: number;
  column: number;
  text: string;
  type: "StringLiteral" | "JsxText";
}

export function scanFile(filePath: string, sourceCode?: string): Issue[] {
  const content = sourceCode ?? fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const issues: Issue[] = [];

  const isI18nCall = (node: ts.Node): boolean => {
    if (ts.isCallExpression(node)) {
      const { expression } = node;
      if (ts.isIdentifier(expression)) {
        return [
          "t",
          "dict",
          "cva",
          "cn",
          "clsx",
          "twMerge",
          "tv",
          "signIn",
          "signOut",
        ].includes(expression.text);
      }
      if (
        ts.isPropertyAccessExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        (expression.expression.text === "console" ||
          expression.expression.text === "logger")
      ) {
        return true;
      }
    }
    return false;
  };

  const isValidAttribute = (node: ts.Node): boolean => {
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText();
      // Attributes that usually contain user-visible text
      const textAttributes = [
        "placeholder",
        "alt",
        "title",
        "aria-label",
        "label",
      ];
      return !textAttributes.includes(name);
    }
    return false;
  };

  // Ignore technical strings and common false positives
  const ignoredValues = new Set<string>([
    "onChange",
    "newPassword",
    "TOO_MANY_LOGIN_ATTEMPTS_IP",
    "TOO_MANY_LOGIN_ATTEMPTS_USER",
    "Europe/Istanbul",
    "uploaded",
    "default",
    "image/",
    "avatar.jpg",
    "avatars",
    "timeZone",
    "load",
    "https://deniko.net/users/",
    "default/avatars/avatar-1.png",
    "default/avatars/avatar-2.png",
    "default/avatars/avatar-3.png",
    "default/avatars/avatar-4.png",
    "default/avatars/avatar-5.png",
    "default/avatars/avatar-6.png",
    "default/",
    "student_no",
    "parent",
    "shadow",
    "student",
    "{teacher}",
    "DB Timeout",
    "blue",
    "amber",
    "GET",
    "POST",
    "shortOffset",
    "timeZoneName",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "feature",
    "general",
    "bug",
    "billing",
    "Ticket created successfully",
    "Failed to submit ticket. Please try again later.",
    "support@deniko.com",
    "+90 (553) 000-0000",
    "application/json",
    "multipart/form-data",
    "application/x-www-form-urlencoded",
    "utf-8",
    "viewport",
    "width=device-width, initial-scale=1",
    "icon",
    "shortcut icon",
    "apple-touch-icon",
    "manifest",
    "canonical",
    "alternate",
    "author",
    "description",
    "keywords",
    "robots",
    "og:title",
    "og:description",
    "og:url",
    "og:image",
    "og:type",
    "og:site_name",
    "twitter:card",
    "twitter:site",
    "twitter:creator",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "summary",
    "summary_large_image",
    "app",
    "website",
    "article",
    "profile",
    "index",
    "follow",
    "noindex",
    "nofollow",
    "latin",
    "cyrillic",
    "greek",
    "class",
    "style",
    "id",
    "for",
    "name",
    "type",
    "href",
    "src",
    "alt",
    "title",
    "placeholder",
    "value",
    "key",
    "target",
    "rel",
    "asChild",
    "{keyword}",
    "{length}",
    "isProfilePublic",
    "showAvatarOnProfile",
    "showEmailOnProfile",
    "showPhoneOnProfile",
    "allowMessagesFromUsers",
    "@deniko",
    "weekly",
    "lesson",
    "finance",
    "HH:mm",
    "EEEE, d MMMM",
    "EEEE HH:mm",
    "Alice Smith",
    "Bob Johnson",
    "Deniko User",
    "$50.00",
    "$45.00",
    "2023-10-01",
    "2023-10-05",
    "2023-10-24",
    "2023-10-25",
    "2023-10-26",
    "10:00 AM",
    "02:00 PM",
    "width",
    "height",
    "loading",
    "decoding",
    "fetchPriority",
    "crossOrigin",
    "referrerPolicy",
    "auto",
    "yes",
    "no",
    "on",
    "off",
    "true",
    "false",
    "button",
    "submit",
    "reset",
    "checkbox",
    "radio",
    "text",
    "password",
    "email",
    "number",
    "tel",
    "url",
    "search",
    "date",
    "time",
    "datetime-local",
    "file",
    "hidden",
    "image",
    "range",
    "color",
    "use client",
    "use server",
    "light",
    "dark",
    "system",
    "default",
    "outline",
    "secondary",
    "ghost",
    "link",
    "destructive",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "6xl",
    "7xl",
    "full",
    "screen",
    "min",
    "max",
    "fit",
    "start",
    "end",
    "center",
    "between",
    "around",
    "evenly",
    "stretch",
    "baseline",
    "row",
    "row-reverse",
    "col",
    "col-reverse",
    "wrap",
    "nowrap",
    "wrap-reverse",
    "visible",
    "invisible",
    "collapse",
    "scroll",
    "auto",
    "hidden",
    "clip",
    "contain",
    "cover",
    "fill",
    "none",
    "scale-down",
    "repeat",
    "no-repeat",
    "repeat-x",
    "repeat-y",
    "round",
    "space",
    "pointer",
    "wait",
    "text",
    "move",
    "help",
    "not-allowed",
    "resize",
    "resize-x",
    "resize-y",
    "resize-none",
    "border-box",
    "content-box",
    "absolute",
    "relative",
    "fixed",
    "sticky",
    "static",
    "block",
    "inline-block",
    "inline",
    "flex",
    "inline-flex",
    "grid",
    "inline-grid",
    "table",
    "inline-table",
    "table-row",
    "table-cell",
    "table-column",
    "table-column-group",
    "table-footer-group",
    "table-header-group",
    "table-row-group",
    "table-caption",
    "list-item",
    "latin",
    "--font-geist-sans",
    "--font-geist-mono",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "application/pdf",
    "application/octet-stream",
    "blob:",
    "data:",
    "en",
    "tr",
    "en_US",
    "tr_TR",
    "asc",
    "desc",
    "canvas",
    "2d",
    "popper",
    "horizontal",
    "vertical",
    "up",
    "down",
    "left",
    "right",
    "success",
    "error",
    "warning",
    "info",
    "idle",
    "TEACHER",
    "STUDENT",
    "ADMIN",
    "ACTIVE",
    "PASSIVE",
    "ARCHIVED",
    "DELETED",
    "PENDING",
    "COMPLETED",
    "CANCELLED",
    "MISSED",
    "SCHEDULED",
    "SUBMITTED",
    "CLAIMED",
    "SHADOW",
    "NOT_VERIFIED",
    "(",
    ")",
    ":",
    "/",
    "-",
    "•",
    "%",
    "=true",
    "Türkçe",
    "google",
    "credentials",
    "resend_cooldown",
    "CredentialsSignin",
    "Email not verified",
    "customer support",
    "overview",
    "undefined",
    "whatsapp",
    "sms",
    "_blank",
    "button, a",
    // Error codes and field names
    "session_not_found",
    "accept_terms",
    "phone_required",
    "password_required",
    "passwords_mismatch",
    "password_min_length",
    "password_complexity",
    "onboarding_error",
    "name_min_length",
    "surname_min_length",
    "invalid_email",
    "unauthorized",
    "teacher_profile_not_found",
    "surname",
    "studentNo",
    "grade",
    "tempPhone",
    "tempEmail",
    "classroomIds",
    "invalid_fields",
    "general",
    "bug",
    "billing",
    "smtp.gmail.com",
    "support@deniko.net",
    "developer@deniko.net",
    "<br>",
    "Ticket submitted successfully",
    "Failed to send email. Please try again later.",
    " | Deniko",
    " required",
    " invalid",
    " min 5 chars",
    " min 10 chars",
    "{ticketId}",
    "subject",
    "message",
    "avatar",
    "selectedAvatar",
    "students",
    "failed_to_upload_avatar",
    "student_created",
    "failed_to_create_student",
    "invalid_token",
    "profile_already_claimed",
    "invite_expired",
    "failed_to_claim_profile",
    "failed_to_update_student",
    "student_archived",
    "failed_to_archive_student",
    "student_not_found",
    "student_unlinked",
    "shadow_student_deleted",
    "failed_to_delete_student",
    "relation_not_found",
    "cannot_delete_claimed",
    "invite_regenerated",
    "failed_to_regenerate_token",
    "invite_opened",
    "invite_closed",
    "failed_to_toggle_invite",
    "customName",
    "privateNotes",
    "firstName",
    "lastName",
    "gradeLevel",
    "phone",
    "parentName",
    "parentPhone",
    "parentEmail",
    "avatarUrl",
    "info_updated",
    "failed_to_update_settings",
    "no_relation_found",
    "hex",
    "confirmPassword",
    "verifyEmail",
    "resendVerificationEmailAction",
    "forgotPassword",
    "resetPassword",
    "registerUser",
    "completeOnboarding",
    "createStudent",
    "claimStudentProfile",
    "getInviteDetails",
    "getStudentProfileByToken",
    "updateStudent",
    "unlinkStudent",
    "deleteStudent",
    "updateStudentRelation",
    "deleteShadowStudent",
    "regenerateInviteToken",
    "toggleInviteLink",
    "updateStudentSettings",
    "Registration Error",
    "Verification Error",
    "Resend Error",
    "Forgot Password Error",
    "Reset Password Error",
    "Onboarding Error",
    "Unauthorized attempt",
    "Invalid fields",
    "Failed to upload avatar",
    "Student created successfully",
    "Failed to create student",
    "Failed to claim profile",
    "Failed to fetch invite details",
    "Failed to fetch profile by token",
    "Failed to update student",
    "Failed to archive student",
    "Failed to delete student",
    "Failed to regenerate token",
    "Failed to toggle invite link",
    "Failed to update student settings",
    "Resend Verification Error",
    "Bir Öğretmen", // This seems like a default value or placeholder

    "LESSON_FEE",
    "currency",
    "TRY",
    "USD",
    "EUR",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "-",
    "+",
    "*",
    "/",
    "=",
    ":",
    ";",
    ",",
    ".",
    "!",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "<",
    ">",
    "|",
    "&",
    "%",
    "$",
    "#",
    "@",
    "_",
    "~",
    "`",
    "^",
    "•",
    "...",
    "http",
    "https",
    "defaults/",
    "seed",
    '[value="settings"]',
    "opacity-50 transition-opacity",
    "action",
    "new-student",
    "PPP p",
    "cookie-consent",
    "imamge/jpeg",
    "image/jpeg",
    "File not found",
    "data",
    "ok",
    "connected",
    "disconnected",
    "Unknown error",
    "x-nonce",
    "daily",
    "monthly",
    "any", // ignore-any-check
    "Web Browser",
    "4.8",
    "p",
    "10_min",
    "2_hours",
    "keydown",
    "click",
    "preserve-3d",
    "center bottom",
    "easeOut",
    "change",
    "string",
    "lazy",
    "pointer-events-none opacity-50",
    "large",
    "text-blue-600 dark:text-blue-400",
    "bg-blue-50 dark:bg-blue-900/20",
    "text-indigo-600 dark:text-indigo-400",
    "bg-indigo-50 dark:bg-indigo-900/20",
    "text-emerald-600 dark:text-emerald-400",
    "bg-emerald-50 dark:bg-emerald-900/20",
    "text-purple-600 dark:text-purple-400",
    "bg-purple-50 dark:bg-purple-900/20",
    "text-orange-600 dark:text-orange-400",
    "bg-orange-50 dark:bg-orange-900/20",
    "text-pink-600 dark:text-pink-400",
    "bg-pink-50 dark:bg-pink-900/20",
    "text-cyan-600 dark:text-cyan-400",
    "bg-cyan-50 dark:bg-cyan-900/20",
    "--feature-axis",
    "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]",
    "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    "cropped.jpg",
    "white",
    "useFormField should be used within <FormField>",
    "span",
    "token",
    "(^| )resend_cooldown=([^;]+)",
    "{time}",
    "{name}",
    "{title}",
    "File not found or Error",

    // --- HTML / ARIA / metadata teknik anahtarlar
    "@context",
    "@type",
    "@id",
    "itemScope",
    "itemProp",
    "itemType",
    "itemRef",
    "itemID",
    "schema.org",
    "lang",
    "dir",
    "role",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-hidden",
    "navigation",
    "main",
    "banner",
    "contentinfo",
    "status",
    "alert",
    "tooltip",
    "progressbar",
    "separator",
    "presentation",

    // --- Next.js / web standart dosya ve route isimleri
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "page",
    "layout",
    "slug",
    "params",
    "middleware",
    "_next",

    // --- environment / deployment isimleri
    "development",
    "production",
    "test",
    "staging",
    "preview",

    // --- tarih / format stringleri
    "YYYY",
    "YY",
    "MM",
    "DD",
    "HH",
    "mm",
    "ss",
    "YYYY-MM-DD",
    "YYYY-MM-DD HH:mm:ss",

    // --- JSON / HTTP / header key'leri
    "Content-Type",
    "Accept",
    "Authorization",
    "User-Agent",
    "Accept-Language",
    "Accept-Encoding",
    "Set-Cookie",
    "Cookie",

    // --- generic enum / state değerleri (DB / domain için, UI metni değil)
    "PUBLISHED",
    "DRAFT",
    "INACTIVE",
    "IN_PROGRESS",
    "MALE",
    "FEMALE",
    "OTHER",
    "PRIMARY",
    "SECONDARY",

    // --- locale / region varyantları
    "en-US",
    "tr-TR",

    // --- teknik flag / anahtar kelimeler
    "idempotent",
    "readonly",
    "nullable",
    "GET_LIST",
    "GET_ONE",
    "CREATE",
    "UPDATE",
    "DELETE_MANY",

    // --- className gibi teknik stringlerde sık geçen ama kullanıcıya direkt görünmeyen parçalar
    "container",
    "content",
    "wrapper",
    "inner",
    "icon-wrapper",

    // --- form / autocomplete teknik değerleri
    "username",
    "new-password",
    "current-password",
    "one-time-code",
    "force-dynamic",
  ]);

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node)) {
      const { text, parent } = node;

      // Ignore empty strings
      if (!text.trim()) return;

      if (ignoredValues.has(text)) return;

      // Ignore paths
      if (
        text.startsWith("/") ||
        text.startsWith("./") ||
        text.startsWith("../") ||
        text.startsWith("@/") ||
        text.startsWith("defaults/")
      )
        return;

      // Ignore URLs
      if (
        text.startsWith("http://") ||
        text.startsWith("https://") ||
        text.startsWith("mailto:") ||
        text.startsWith("tel:")
      )
        return;

      // Ignore colors
      if (
        text.startsWith("#") &&
        (text.length === 4 || text.length === 7 || text.length === 9)
      )
        return;

      // Ignore CSS units and values
      if (/^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|s|ms|deg|rad|turn|fr)$/.test(text))
        return;
      if (/^calc\(.+\)$/.test(text)) return;
      if (/^var\(.+\)$/.test(text)) return;
      if (/^url\(.+\)$/.test(text)) return;
      if (/^rgb\(.+\)$/.test(text)) return;
      if (/^rgba\(.+\)$/.test(text)) return;
      if (/^hsl\(.+\)$/.test(text)) return;
      if (/^hsla\(.+\)$/.test(text)) return;
      if (/^clamp\(.+\)$/.test(text)) return;
      if (/^min\(.+\)$/.test(text)) return;
      if (/^max\(.+\)$/.test(text)) return;
      if (/^fit-content\(.+\)$/.test(text)) return;
      if (/^repeat\(.+\)$/.test(text)) return;
      if (/^cubic-bezier\(.+\)$/.test(text)) return;
      if (/^steps\(.+\)$/.test(text)) return;
      if (/^path\(.+\)$/.test(text)) return;
      if (/^blur\(.+\)$/.test(text)) return;
      if (/^brightness\(.+\)$/.test(text)) return;
      if (/^contrast\(.+\)$/.test(text)) return;
      if (/^drop-shadow\(.+\)$/.test(text)) return;
      if (/^grayscale\(.+\)$/.test(text)) return;
      if (/^hue-rotate\(.+\)$/.test(text)) return;
      if (/^invert\(.+\)$/.test(text)) return;
      if (/^opacity\(.+\)$/.test(text)) return;
      if (/^saturate\(.+\)$/.test(text)) return;
      if (/^sepia\(.+\)$/.test(text)) return;
      if (/^translate\(.+\)$/.test(text)) return;
      if (/^translateX\(.+\)$/.test(text)) return;
      if (/^translateY\(.+\)$/.test(text)) return;
      if (/^translateZ\(.+\)$/.test(text)) return;
      if (/^translate3d\(.+\)$/.test(text)) return;
      if (/^scale\(.+\)$/.test(text)) return;
      if (/^scaleX\(.+\)$/.test(text)) return;
      if (/^scaleY\(.+\)$/.test(text)) return;
      if (/^scaleZ\(.+\)$/.test(text)) return;
      if (/^scale3d\(.+\)$/.test(text)) return;
      if (/^rotate\(.+\)$/.test(text)) return;
      if (/^rotateX\(.+\)$/.test(text)) return;
      if (/^rotateY\(.+\)$/.test(text)) return;
      if (/^rotateZ\(.+\)$/.test(text)) return;
      if (/^rotate3d\(.+\)$/.test(text)) return;
      if (/^skew\(.+\)$/.test(text)) return;
      if (/^skewX\(.+\)$/.test(text)) return;
      if (/^skewY\(.+\)$/.test(text)) return;
      if (/^matrix\(.+\)$/.test(text)) return;
      if (/^matrix3d\(.+\)$/.test(text)) return;
      if (/^perspective\(.+\)$/.test(text)) return;

      // Ignore Tailwind classes (heuristic: contains - or :)
      if ((text.includes("-") || text.includes(":")) && !text.includes(" ")) {
        // Check if it looks like a tailwind class
        const parts = text.split(":");
        const lastPart = parts[parts.length - 1];
        if (
          lastPart.startsWith("text-") ||
          lastPart.startsWith("bg-") ||
          lastPart.startsWith("border-") ||
          lastPart.startsWith("p-") ||
          lastPart.startsWith("m-") ||
          lastPart.startsWith("w-") ||
          lastPart.startsWith("h-") ||
          lastPart.startsWith("flex-") ||
          lastPart.startsWith("grid-") ||
          lastPart.startsWith("gap-") ||
          lastPart.startsWith("items-") ||
          lastPart.startsWith("justify-") ||
          lastPart.startsWith("self-") ||
          lastPart.startsWith("content-") ||
          lastPart.startsWith("place-") ||
          lastPart.startsWith("order-") ||
          lastPart.startsWith("col-") ||
          lastPart.startsWith("row-") ||
          lastPart.startsWith("auto-") ||
          lastPart.startsWith("min-") ||
          lastPart.startsWith("max-") ||
          lastPart.startsWith("font-") ||
          lastPart.startsWith("leading-") ||
          lastPart.startsWith("tracking-") ||
          lastPart.startsWith("align-") ||
          lastPart.startsWith("whitespace-") ||
          lastPart.startsWith("break-") ||
          lastPart.startsWith("overflow-") ||
          lastPart.startsWith("overscroll-") ||
          lastPart.startsWith("inset-") ||
          lastPart.startsWith("top-") ||
          lastPart.startsWith("right-") ||
          lastPart.startsWith("bottom-") ||
          lastPart.startsWith("left-") ||
          lastPart.startsWith("z-") ||
          lastPart.startsWith("visible") ||
          lastPart.startsWith("invisible") ||
          lastPart.startsWith("collapse") ||
          lastPart.startsWith("static") ||
          lastPart.startsWith("fixed") ||
          lastPart.startsWith("absolute") ||
          lastPart.startsWith("relative") ||
          lastPart.startsWith("sticky") ||
          lastPart.startsWith("float-") ||
          lastPart.startsWith("clear-") ||
          lastPart.startsWith("object-") ||
          lastPart.startsWith("table-") ||
          lastPart.startsWith("list-") ||
          lastPart.startsWith("appearance-") ||
          lastPart.startsWith("cursor-") ||
          lastPart.startsWith("pointer-") ||
          lastPart.startsWith("resize-") ||
          lastPart.startsWith("select-") ||
          lastPart.startsWith("sr-") ||
          lastPart.startsWith("not-sr-") ||
          lastPart.startsWith("fill-") ||
          lastPart.startsWith("stroke-") ||
          lastPart.startsWith("shadow-") ||
          lastPart.startsWith("opacity-") ||
          lastPart.startsWith("mix-") ||
          lastPart.startsWith("bg-blend-") ||
          lastPart.startsWith("filter-") ||
          lastPart.startsWith("blur-") ||
          lastPart.startsWith("brightness-") ||
          lastPart.startsWith("contrast-") ||
          lastPart.startsWith("drop-shadow-") ||
          lastPart.startsWith("grayscale-") ||
          lastPart.startsWith("hue-rotate-") ||
          lastPart.startsWith("invert-") ||
          lastPart.startsWith("saturate-") ||
          lastPart.startsWith("sepia-") ||
          lastPart.startsWith("backdrop-") ||
          lastPart.startsWith("transition-") ||
          lastPart.startsWith("ease-") ||
          lastPart.startsWith("duration-") ||
          lastPart.startsWith("delay-") ||
          lastPart.startsWith("animate-") ||
          lastPart.startsWith("transform-") ||
          lastPart.startsWith("origin-") ||
          lastPart.startsWith("scale-") ||
          lastPart.startsWith("rotate-") ||
          lastPart.startsWith("translate-") ||
          lastPart.startsWith("skew-") ||
          lastPart.startsWith("outline-") ||
          lastPart.startsWith("ring-") ||
          lastPart.startsWith("offset-") ||
          lastPart.startsWith("decoration-") ||
          lastPart.startsWith("accent-") ||
          lastPart.startsWith("caret-") ||
          lastPart.startsWith("scroll-") ||
          lastPart.startsWith("snap-") ||
          lastPart.startsWith("touch-") ||
          lastPart.startsWith("will-change-") ||
          lastPart.startsWith("content-") ||
          lastPart.startsWith("group-") ||
          lastPart.startsWith("peer-") ||
          lastPart.startsWith("hover:") ||
          lastPart.startsWith("focus:") ||
          lastPart.startsWith("active:") ||
          lastPart.startsWith("disabled:") ||
          lastPart.startsWith("visited:") ||
          lastPart.startsWith("checked:") ||
          lastPart.startsWith("first:") ||
          lastPart.startsWith("last:") ||
          lastPart.startsWith("odd:") ||
          lastPart.startsWith("even:") ||
          lastPart.startsWith("dark:") ||
          lastPart.startsWith("light:") ||
          lastPart.startsWith("print:") ||
          lastPart.startsWith("screen:") ||
          lastPart.startsWith("sm:") ||
          lastPart.startsWith("md:") ||
          lastPart.startsWith("lg:") ||
          lastPart.startsWith("xl:") ||
          lastPart.startsWith("2xl:")
        ) {
          return;
        }
      }

      // Ignore time strings (HH:MM)
      if (/^\d{1,2}:\d{2}$/.test(text)) return;

      // Ignore cookie strings
      if (text.includes("cookie_consent=") || text.includes("max-age=")) return;

      // Ignore component names (PascalCase)
      if (/^[A-Z][a-zA-Z0-9]*$/.test(text)) return;

      // Ignore single characters that are not letters
      if (text.length === 1 && !/[a-zA-Z]/.test(text)) return;

      // Ignore strings that are just numbers
      if (/^\d+$/.test(text)) return;

      // Ignore strings that are just symbols
      if (/^[^a-zA-Z0-9]+$/.test(text)) return;

      // 1. Ignore imports/exports
      if (
        ts.isImportDeclaration(parent) ||
        ts.isExportDeclaration(parent) ||
        ts.isExternalModuleReference(parent) ||
        ts.isModuleDeclaration(parent)
      )
        return;
      if (ts.isLiteralTypeNode(parent)) return; // type T = "literal"

      // 2. Ignore object property keys and specific values
      if (ts.isPropertyAssignment(parent)) {
        if (parent.name === node) return;
        if (
          ts.isIdentifier(parent.name) &&
          [
            "className",
            "class",
            "variant",
            "size",
            "href",
            "src",
            "type",
            "id",
            "name",
            "value",
            "key",
            "target",
            "rel",
            "asChild",
          ].includes(parent.name.text)
        )
          return;
      }

      // 3. Ignore specific function calls (t, dict, console, cn, cva, etc.)
      // Check if direct parent is call expression (arg) or if it's inside an array/object passed to call
      let current = parent;
      while (current) {
        if (ts.isCallExpression(current)) {
          if (isI18nCall(current)) return;
          // Stop going up if we hit a block or function
          break;
        }
        if (
          ts.isBlock(current) ||
          ts.isFunctionDeclaration(current) ||
          ts.isArrowFunction(current) ||
          ts.isJsxElement(current)
        )
          break;
        current = current.parent;
      }

      // 4. Ignore JSX Attributes that are not text-related
      if (ts.isJsxAttribute(parent)) {
        if (isValidAttribute(parent)) return;
      }

      // 5. Ignore technical strings (simple heuristic: no spaces, snake_case or camelCase)
      // This is risky but often needed. Let's stick to the user requirement: "i18n olmayan string literal"
      // If we are strict, we report everything.
      // Let's report it if it's not excluded above.

      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );
      issues.push({
        file: filePath,
        line: line + 1,
        column: character + 1,
        text: text,
        type: "StringLiteral",
      });
    } else if (ts.isJsxText(node)) {
      const { text } = node;
      const trimmedText = text.trim();
      if (trimmedText.length > 0) {
        if (ignoredValues.has(trimmedText)) return;

        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );
        issues.push({
          file: filePath,
          line: line + 1,
          column: character + 1,
          text: trimmedText,
          type: "JsxText",
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return issues;
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Main execution if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");

  const rootDir = process.cwd();
  // Scan app and components folders
  const dirsToScan = [
    path.join(rootDir, "app"),
    path.join(rootDir, "components"),
  ];

  let allIssues: Issue[] = [];

  dirsToScan.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir);
      files.forEach((file) => {
        allIssues = allIssues.concat(scanFile(file));
      });
    }
  });

  if (jsonOutput) {
    console.log(JSON.stringify(allIssues, null, 2));
  } else if (allIssues.length > 0) {
    console.log("Hardcoded strings found:");
    allIssues.forEach((issue) => {
      console.log(
        `${issue.file}:${issue.line}:${issue.column} - [${issue.type}] "${issue.text}"`
      );
    });
    console.log(`\nTotal issues: ${allIssues.length}`);
    process.exit(1);
  } else {
    console.log("No hardcoded strings found.");
  }
  if (allIssues.length > 0) {
    process.exit(1);
  }
}
