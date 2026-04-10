import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "tr", "de", "nl", "zh", "ja"],
  defaultLocale: "en",
});
