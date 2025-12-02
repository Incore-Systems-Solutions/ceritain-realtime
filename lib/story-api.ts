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

export const storyApi = {
  async initStory(token: string): Promise<StoryAPIResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/story-ai/intial-story-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/api/story-ai/conn-story-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
