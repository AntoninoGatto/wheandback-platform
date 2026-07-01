import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en", "fr", "es", "de"],
  defaultLocale: "it",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
