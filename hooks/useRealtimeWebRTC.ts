import { useState, useEffect, useRef, useCallback } from "react";
import { setupAISpeakingDetection } from "@/lib/realtime-api";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface RealtimeWebRTCState {
  status: ConnectionStatus;
  error: string | null;
  transcript: string;
  aiResponse: string;
  isMuted: boolean;
  audioLevel: number;
  isUserSpeaking: boolean;
}

/**
 * Callbacks for speaking events
 */
export interface SpeakingCallbacks {
  onUserSpeakingStart?: () => void;
  onUserSpeakingStop?: (duration: number) => void;
  onAISpeakingStart?: () => void;
  onAISpeakingStop?: (duration: number) => void;
}

export interface RealtimeWebRTCActions {
  connect: (token: string, callbacks?: SpeakingCallbacks) => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

/**
 * Voice Activity Detection (VAD) configuration
 */
const VAD_CONFIG = {
  // Audio energy threshold (0-1). Above this = user is speaking
  ENERGY_THRESHOLD: 0.02,
  // Minimum duration to consider as speaking (ms)
  MIN_SPEAKING_DURATION: 300,
  // Silence duration to consider speaking stopped (ms)
  SILENCE_DURATION: 1500,
};

export function useRealtimeWebRTC(): [
  RealtimeWebRTCState,
  RealtimeWebRTCActions
] {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // VAD state
  const userSpeakingStartTimeRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef<SpeakingCallbacks>({});
  const aiSpeakingCleanupRef = useRef<(() => void) | null>(null);

  /**
   * Voice Activity Detection
   * Monitors audio level and detects when user starts/stops speaking
   */
  const checkVoiceActivity = useCallback(
    (audioLevel: number) => {
      const now = Date.now();
      const isSpeaking = audioLevel > VAD_CONFIG.ENERGY_THRESHOLD;

      if (isSpeaking) {
        lastSoundTimeRef.current = now;

        // User started speaking
        if (!isUserSpeaking && !userSpeakingStartTimeRef.current) {
          const timeSinceLastSound = now - lastSoundTimeRef.current;

          if (timeSinceLastSound < VAD_CONFIG.MIN_SPEAKING_DURATION) {
            return; // Too short, might be noise
          }

          setIsUserSpeaking(true);
          userSpeakingStartTimeRef.current = now;
          console.log("🎤 User started speaking");
          callbacksRef.current.onUserSpeakingStart?.();
        }

        // Clear any pending stop timeout
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
          speakingTimeoutRef.current = null;
        }
      } else {
        // Check if user stopped speaking
        if (isUserSpeaking && userSpeakingStartTimeRef.current) {
          const silenceDuration = now - lastSoundTimeRef.current;

          if (silenceDuration >= VAD_CONFIG.SILENCE_DURATION) {
            // User stopped speaking
            const speakingDuration = Math.round(
              (now - userSpeakingStartTimeRef.current) / 1000
            );

            setIsUserSpeaking(false);
            console.log(
              `🎤 User stopped speaking. Duration: ${speakingDuration}s`
            );

            // Call callback with duration
            callbacksRef.current.onUserSpeakingStop?.(speakingDuration);

            userSpeakingStartTimeRef.current = null;
          }
        }
      }
    },
    [isUserSpeaking]
  );

  /**
   * Monitor audio level and detect voice activity
   */
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;

      setAudioLevel(normalizedLevel);

      // Check voice activity if not muted
      if (!isMuted) {
        checkVoiceActivity(normalizedLevel);
      }

      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }, [isMuted, checkVoiceActivity]);

  /**
   * Disconnect and cleanup all resources
   */
  const disconnect = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clear speaking timeout
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }

    // Cleanup AI speaking detection
    if (aiSpeakingCleanupRef.current) {
      aiSpeakingCleanupRef.current();
      aiSpeakingCleanupRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    userSpeakingStartTimeRef.current = null;
    setIsUserSpeaking(false);
    setStatus("disconnected");
  }, []);

  /**
   * Connect to WebRTC with speaker detection
   */
  const connect = useCallback(
    async (token: string, callbacks?: SpeakingCallbacks) => {
      try {
        setStatus("connecting");
        setError(null);

        // Store callbacks
        if (callbacks) {
          callbacksRef.current = callbacks;
        }

        // Create peer connection
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        // Handle incoming audio from model
        pc.ontrack = (event) => {
          const [stream] = event.streams;
          const remoteAudio = new Audio();
          remoteAudio.srcObject = stream;
          remoteAudio.autoplay = true;
          remoteAudio.play().catch(console.error);
        };

        // Get user media and add to peer connection
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioStreamRef.current = stream;

        // Add mic tracks to peer connection
        for (const track of stream.getTracks()) {
          pc.addTrack(track, stream);
        }

        // Ensure we can receive audio from the model
        pc.addTransceiver("audio", { direction: "recvonly" });

        // Setup audio context for visualization and VAD
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        monitorAudioLevel();

        // Data channel for Realtime events
        const dataChannel = pc.createDataChannel("oai-events");
        dataChannelRef.current = dataChannel;

        dataChannel.onopen = () => {
          console.log("Data channel opened");
          setStatus("connected");
        };

        dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received event:", message.type, message);

            // Handle different message types
            if (message.type === "response.audio_transcript.done") {
              setTranscript(message.transcript || "");
            } else if (message.type === "response.done") {
              const text =
                message.response?.output?.[0]?.content?.[0]?.transcript;
              if (text) setAiResponse(text);
            }
          } catch (err) {
            console.error("Failed to parse data channel message:", err);
          }
        };

        dataChannel.onerror = (err) => {
          console.error("Data channel error:", err);
          setError("Data channel error occurred");
        };

        // Setup AI speaking detection
        aiSpeakingCleanupRef.current = setupAISpeakingDetection(dataChannel, {
          onAISpeakingStart: callbacks?.onAISpeakingStart,
          onAISpeakingStop: callbacks?.onAISpeakingStop,
        });

        // Create and set local description
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send SDP offer to OpenAI Realtime WebRTC endpoint
        console.log("Using token:", token.substring(0, 20) + "...");
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResp = await fetch(
          `https://api.openai.com/v1/realtime?model=${encodeURIComponent(
            model
          )}`,
          {
            method: "POST",
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/sdp",
              "OpenAI-Beta": "realtime=v1",
            },
          }
        );

        if (!sdpResp.ok) {
          const t = await sdpResp.text();
          console.error("SDP Response Error:", t);
          throw new Error(`SDP failed: ${sdpResp.status} ${t}`);
        }

        const answerSDP = await sdpResp.text();
        console.log("Received SDP answer:", answerSDP.substring(0, 200));

        await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
        console.log("Remote description set successfully");
      } catch (err) {
        console.error("WebRTC connection error:", err);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : `Connection failed: ${JSON.stringify(err)}`
        );
        disconnect();
      }
    },
    [disconnect, monitorAudioLevel]
  );

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    if (audioStreamRef.current) {
      const audioTrack = audioStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  /**
   * Set muted state
   */
  const setMutedState = useCallback((muted: boolean) => {
    if (audioStreamRef.current) {
      const audioTrack = audioStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
        setIsMuted(muted);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return [
    {
      status,
      error,
      transcript,
      aiResponse,
      isMuted,
      audioLevel,
      isUserSpeaking,
    },
    {
      connect,
      disconnect,
      toggleMute,
      setMuted: setMutedState,
    },
  ];
}
