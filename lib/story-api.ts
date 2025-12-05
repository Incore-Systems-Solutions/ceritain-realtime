// Story AI API utilities

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiceritain.indonesiacore.com";

export interface StoryMessage {
  id: number;
  userId: number;
  initId: string;
  response: string;
  isUser: "user" | "assistant";
  readable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StoryAPIResponse {
  errorCode: number;
  message: string;
  result?: StoryMessage;
}

/**
 * Get current locale from URL pathname
 * Returns locale code (id, en, zh, ar) or default 'id'
 */
function getCurrentLocale(): string {
  if (typeof window === "undefined") return "id";

  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/(id|en|zh|ar)/);

  return localeMatch ? localeMatch[1] : "id";
}

/**
 * Map locale to Accept-Language header format
 */
function getAcceptLanguageHeader(locale: string): string {
  const languageMap: Record<string, string> = {
    id: "id-ID,id;q=0.9",
    en: "en-US,en;q=0.9",
    zh: "zh-CN,zh;q=0.9",
    ar: "ar-SA,ar;q=0.9",
  };

  return languageMap[locale] || languageMap["id"];
}

export const storyApi = {
  async initStory(token: string): Promise<StoryAPIResponse> {
    const locale = getCurrentLocale();
    const acceptLanguage = getAcceptLanguageHeader(locale);

    const response = await fetch(
      `${API_BASE_URL}/api/story-ai/intial-story-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": acceptLanguage,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Failed to initialize story");
    }

    return data;
  },

  async sendMessage(
    token: string,
    initId: string,
    prompt: string
  ): Promise<StoryAPIResponse> {
    const locale = getCurrentLocale();
    const acceptLanguage = getAcceptLanguageHeader(locale);

    const response = await fetch(`${API_BASE_URL}/api/story-ai/conn-story-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Accept-Language": acceptLanguage,
      },
      body: JSON.stringify({
        initId,
        prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Failed to send message");
    }

    return data;
  },
};
