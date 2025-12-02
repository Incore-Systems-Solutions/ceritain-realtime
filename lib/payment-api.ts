// Payment API utilities

const PAYMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
  "https://midtrans.indonesiacore.com";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiceritain.indonesiacore.com";

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
    const response = await fetch(
      `${PAYMENT_API_BASE_URL}/api/midtrans/payment-channel`
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
    const response = await fetch(`${API_BASE_URL}/api/token/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
