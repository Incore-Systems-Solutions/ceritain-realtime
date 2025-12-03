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

/**
 * Response interface for token usage API
 */
export interface TokenUsageResponse {
  errorCode: number;
  message: string;
  result?: unknown;
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

  /**
   * Post token usage for user speaking duration
   * @param token - Auth token
   * @param time - Duration in seconds
   * @returns Response with status code
   * @throws Error with status code if request fails
   */
  async postTokenUsageUser(
    token: string,
    time: number
  ): Promise<TokenUsageResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/realtime/token-usage-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ time }),
        }
      );

      const data = await response.json();

      // Return response with status code for caller to handle
      return {
        errorCode: response.status === 400 ? 400 : data.errorCode,
        message: data.message || "",
        result: data.result,
      };
    } catch (error) {
      console.error("Failed to post token usage (user):", error);
      throw error;
    }
  },

  /**
   * Post token usage for AI speaking duration
   * @param token - Auth token
   * @param time - Duration in seconds
   * @returns Response with status code
   * @throws Error with status code if request fails
   */
  async postTokenUsageAI(
    token: string,
    time: number
  ): Promise<TokenUsageResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/realtime/token-usage-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ time }),
        }
      );

      const data = await response.json();

      // Return response with status code for caller to handle
      return {
        errorCode: response.status === 400 ? 400 : data.errorCode,
        message: data.message || "",
        result: data.result,
      };
    } catch (error) {
      console.error("Failed to post token usage (AI):", error);
      throw error;
    }
  },
};
