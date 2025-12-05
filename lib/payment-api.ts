// Payment API utilities

const PAYMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
  "https://midtrans.indonesiacore.com";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiceritain.indonesiacore.com";

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

export interface PaymentChannel {
  id: number;
  nama_payment: string;
  code_payment: string;
  persentase_fee: string;
  flat_fee: string | null;
  icon: string | null;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_show: string;
}

export interface PaymentChannelResponse {
  status: string;
  message: string;
  data: PaymentChannel[];
}

export interface TopupResponse {
  errorCode: number;
  message: string;
  result?: {
    order_id: string;
    payment_url: string;
    expired_at: string;
  };
}

export const paymentApi = {
  async getPaymentChannels(): Promise<PaymentChannelResponse> {
    const locale = getCurrentLocale();
    const acceptLanguage = getAcceptLanguageHeader(locale);

    const response = await fetch(
      `${PAYMENT_API_BASE_URL}/api/midtrans/payment-channel`,
      {
        headers: {
          "Accept-Language": acceptLanguage,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to get payment channels");
    }

    return data;
  },

  async createTopup(
    token: string,
    paymentChannelId: number,
    nominal: number
  ): Promise<TopupResponse> {
    const locale = getCurrentLocale();
    const acceptLanguage = getAcceptLanguageHeader(locale);

    const response = await fetch(`${API_BASE_URL}/api/token/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Accept-Language": acceptLanguage,
      },
      body: JSON.stringify({
        paymentChannelId,
        nominal,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Failed to create topup");
    }

    return data;
  },
};
