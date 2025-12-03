// Realtime API utilities

export interface RealtimeSessionResponse {
  errorCode: number;
  message: string;
  result: {
    object: string;
    id: string;
    model: string;
    modalities: string[];
    instructions: string;
    voice: string;
    output_audio_format: string;
    tools: any[];
    tool_choice: string;
    temperature: number;
    max_response_output_tokens: string;
    turn_detection: {
      type: string;
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
      idle_timeout_ms: number | null;
      create_response: boolean;
      interrupt_response: boolean;
    };
    speed: number;
    tracing: any;
    truncation: string;
    prompt: any;
    expires_at: number;
    input_audio_noise_reduction: any;
    input_audio_format: string;
    input_audio_transcription: any;
    client_secret: {
      value: string;
      expires_at: number;
    };
    include: unknown;
  };
}

export interface RealtimeSessionPayload {
  prompt: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}

/**
 * Callback interface for AI speaking events
 */
export interface AISpeakingCallbacks {
  onAISpeakingStart?: () => void;
  onAISpeakingStop?: (duration: number) => void;
}

/**
 * Create a new realtime session with the API
 * @param payload - Session configuration (prompt, voice)
 * @param token - Authorization token (optional)
 */
export async function createRealtimeSession(
  payload: RealtimeSessionPayload,
  token?: string
): Promise<string> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      process.env.NEXT_PUBLIC_REALTIME_API_URL ||
        "https://apiceritain.indonesiacore.com/api/realtime/session",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: RealtimeSessionResponse = await response.json();

    console.log("Session created:", {
      sessionId: data.result?.id,
      expiresAt: data.result?.client_secret?.expires_at,
    });

    // Check for API error
    if (data.errorCode !== 0) {
      throw new Error(`API Error: ${data.message}`);
    }

    // Extract client_secret from result
    if (!data.result?.client_secret?.value) {
      throw new Error("Invalid response: missing result.client_secret.value");
    }

    return data.result.client_secret.value;
  } catch (error) {
    console.error("Failed to create realtime session:", error);
    throw error;
  }
}

/**
 * Setup AI speaking detection on data channel
 * Monitors WebRTC events to detect when AI starts and stops speaking
 *
 * @param dataChannel - RTCDataChannel to monitor
 * @param callbacks - Callbacks for AI speaking events
 */
export function setupAISpeakingDetection(
  dataChannel: RTCDataChannel,
  callbacks: AISpeakingCallbacks
): () => void {
  let aiSpeakingStartTime: number | null = null;
  let isAISpeaking = false;

  const handleMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);

      // Detect AI starts speaking
      // This can be triggered by response.audio.delta or response.audio_transcript.delta
      if (
        message.type === "response.audio.delta" ||
        message.type === "response.audio_transcript.delta" ||
        message.type === "response.content_part.added"
      ) {
        if (!isAISpeaking) {
          isAISpeaking = true;
          aiSpeakingStartTime = Date.now();
          console.log("🤖 AI started speaking");
          callbacks.onAISpeakingStart?.();
        }
      }

      // Detect AI stops speaking
      // This is triggered when response is done
      if (
        message.type === "response.done" ||
        message.type === "response.audio_transcript.done" ||
        message.type === "response.audio.done"
      ) {
        if (isAISpeaking && aiSpeakingStartTime) {
          const duration = Math.round(
            (Date.now() - aiSpeakingStartTime) / 1000
          );
          isAISpeaking = false;
          aiSpeakingStartTime = null;
          console.log(`🤖 AI stopped speaking. Duration: ${duration}s`);
          callbacks.onAISpeakingStop?.(duration);
        }
      }
    } catch (err) {
      // Ignore parse errors
    }
  };

  dataChannel.addEventListener("message", handleMessage);

  // Cleanup function
  return () => {
    dataChannel.removeEventListener("message", handleMessage);
  };
}
