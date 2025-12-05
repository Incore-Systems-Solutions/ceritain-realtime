export const locales = ["id", "en", "zh", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

export const localeNames: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  zh: "中文",
  ar: "العربية",
};

export const localeFlags: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
  zh: "🇨🇳",
  ar: "🇸🇦",
};
