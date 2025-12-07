import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Custom rule to enforce i18n
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXText[value=/\\w/]",
          message:
            "Avoid hardcoded text in JSX. Use i18n dictionaries instead.",
        },
        {
          selector: "JSXAttribute[name.name='placeholder'] > Literal",
          message:
            "Avoid hardcoded placeholder text. Use i18n dictionaries instead.",
        },
        {
          selector: "JSXAttribute[name.name='alt'] > Literal",
          message: "Avoid hardcoded alt text. Use i18n dictionaries instead.",
        },
        {
          selector: "JSXAttribute[name.name='title'] > Literal",
          message: "Avoid hardcoded title text. Use i18n dictionaries instead.",
        },
        {
          selector: "JSXAttribute[name.name='aria-label'] > Literal",
          message:
            "Avoid hardcoded aria-label text. Use i18n dictionaries instead.",
        },
      ],
    },
  },
]);

export default eslintConfig;
