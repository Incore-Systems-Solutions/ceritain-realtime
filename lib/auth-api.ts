// Auth API utilities

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiceritain.indonesiacore.com";

export interface RequestOTPResponse {
  errorCode: number;
  message: string;
  result?: unknown;
}

export interface VerifyOTPResponse {
  errorCode: number;
  message: string;
  result?: {
    token: string;
    user: {
      active: boolean;
      name: string;
      address: string;
      email: string;
      avatar: string;
      phone: string;
      username: string;
      is_profile: boolean;
    };
  };
}

export interface TokenResponse {
  errorCode: number;
  message: string;
  result?: number;
}

export const authApi = {
  async requestOTP(email: string): Promise<RequestOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Failed to request OTP");
    }

    return data;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: "",
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Invalid OTP");
    }

    return data;
  },

  async getToken(token: string): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.errorCode !== 0) {
      throw new Error(data.message || "Failed to get token");
    }

    return data;
  },
};
