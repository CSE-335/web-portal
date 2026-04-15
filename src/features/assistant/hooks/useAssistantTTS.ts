// ============================================================================
// Text-to-speech: ElevenLabs (/api/tts/elevenlabs) → OpenAI (/api/tts/openai) → Web Speech API.
// ============================================================================

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseRetryAfterSeconds } from "@/lib/parseRetryAfter";
import { useAssistant } from "../AssistantContext";
import type { DialogueLine } from "../types";

interface TTSConfig {
  rate?: number;
  lauriePitch?: number;
  livvyPitch?: number;
  laurieVoiceHint?: string;
  livvyVoiceHint?: string;
  interLinePauseMs?: number;
}

const DEFAULTS: Required<TTSConfig> = {
  rate: 0.95,
  lauriePitch: 1.0,
  livvyPitch: 1.15,
  laurieVoiceHint: "Female",
  livvyVoiceHint: "Female",
  interLinePauseMs: 400,
};

/** Shown when a cloud TTS route returns 429 (Upstash or provider quota). */
export const TTS_RATE_LIMIT_WARNING =
  "Rate limit exceeded for TTS, reverting to fallback";

type TtsHttpAudioOutcome = {
  success: boolean;
  rateLimited: boolean;
  /** Upstash blocked this request; skip the next cloud tier (same bucket). */
  skipSecondaryCloud: boolean;
  /** From `Retry-After` when the server sends it (e.g. Upstash). */
  retryAfterSeconds: number | null;
};

// ---------------------------------------------------------------------------
// MP3 from /api/tts/elevenlabs (ElevenLabs) or /api/tts/openai (OpenAI)
// ---------------------------------------------------------------------------

function isStaleUtterance(
  utteranceEpoch: number,
  epochRef: React.MutableRefObject<number>,
): boolean {
  return utteranceEpoch !== epochRef.current;
}

async function speakViaTtsHttp(
  apiPath: string,
  line: DialogueLine,
  activeAudioRef: React.MutableRefObject<HTMLAudioElement | null>,
  activeUrlRef: React.MutableRefObject<string | null>,
  isPlayingRef: React.MutableRefObject<boolean>,
  signal: AbortSignal,
  utteranceEpoch: number,
  epochRef: React.MutableRefObject<number>,
): Promise<TtsHttpAudioOutcome> {
  const fail = (
    rateLimited = false,
    skipSecondaryCloud = false,
    retryAfterSeconds: number | null = null,
  ): TtsHttpAudioOutcome => ({
    success: false,
    rateLimited,
    skipSecondaryCloud,
    retryAfterSeconds,
  });

  try {
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: line.text, speaker: line.speaker }),
      signal,
    });

    if (isStaleUtterance(utteranceEpoch, epochRef) || signal.aborted) {
      return fail();
    }
    if (!res.ok) {
      const rateLimited = res.status === 429;
      const skipSecondaryCloud =
        rateLimited
        && res.headers.get("x-tts-limited-by")?.toLowerCase() === "upstash";
      const retryAfterSeconds = rateLimited ? parseRetryAfterSeconds(res) : null;
      return fail(rateLimited, skipSecondaryCloud, retryAfterSeconds);
    }
    if (!isPlayingRef.current) return fail();

    const blob = await res.blob();
    if (isStaleUtterance(utteranceEpoch, epochRef) || signal.aborted) return fail();

    const url = URL.createObjectURL(blob);
    activeUrlRef.current = url;

    return new Promise<TtsHttpAudioOutcome>((resolve) => {
      if (isStaleUtterance(utteranceEpoch, epochRef) || !isPlayingRef.current) {
        URL.revokeObjectURL(url);
        activeUrlRef.current = null;
        return resolve(fail());
      }

      const audio = new Audio(url);
      activeAudioRef.current = audio;

      const cleanup = () => {
        activeAudioRef.current = null;
        if (activeUrlRef.current === url) {
          URL.revokeObjectURL(url);
          activeUrlRef.current = null;
        }
      };
      const ok = (): TtsHttpAudioOutcome => ({
        success: true,
        rateLimited: false,
        skipSecondaryCloud: false,
        retryAfterSeconds: null,
      });
      audio.onended = () => { cleanup(); resolve(ok()); };
      audio.onerror = () => { cleanup(); resolve(fail()); };
      audio.play().catch(() => { cleanup(); resolve(fail()); });
    });
  } catch {
    return fail();
  }
}

// ---------------------------------------------------------------------------
// Web Speech API fallback
// ---------------------------------------------------------------------------

function speakViaWebSpeech(
  line: DialogueLine,
  voices: SpeechSynthesisVoice[],
  cfg: Required<TTSConfig>
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(line.text);

    const hint = line.speaker === "Laurie" ? cfg.laurieVoiceHint : cfg.livvyVoiceHint;
    const voice =
      voices.find((v) => v.name.includes(hint) && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;

    u.rate = cfg.rate;
    u.pitch = line.speaker === "Laurie" ? cfg.lauriePitch : cfg.livvyPitch;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseAssistantTTSReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  playDialogue: (lines: DialogueLine[]) => Promise<void>;
  stop: () => void;
  voices: SpeechSynthesisVoice[];
}

export function useAssistantTTS(config?: TTSConfig): UseAssistantTTSReturn {
  const { state, advanceLine, dispatch } = useAssistant();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const cfg = useMemo(
    () => ({ ...DEFAULTS, ...config }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config?.rate, config?.lauriePitch, config?.livvyPitch, config?.laurieVoiceHint, config?.livvyVoiceHint, config?.interLinePauseMs]
  );
  const isPlayingRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  /** Bumped in `stop()` so in-flight TTS (fetch/audio) cannot overlap the next line. */
  const utteranceEpochRef = useRef(0);
  const ttsFetchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const hasWebSpeech =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setIsSupported(hasWebSpeech);

    if (hasWebSpeech) {
      const load = () => setVoices(window.speechSynthesis.getVoices());
      load();
      window.speechSynthesis.addEventListener("voiceschanged", load);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    }
  }, []);

  const speakLine = useCallback(
    async (line: DialogueLine): Promise<void> => {
      setIsSpeaking(true);

      const utteranceEpoch = utteranceEpochRef.current;
      const ac = new AbortController();
      ttsFetchAbortRef.current = ac;

      try {
        const {
          success: primarySuccess,
          rateLimited: primaryRateLimited,
          skipSecondaryCloud,
          retryAfterSeconds: primaryRetryAfter,
        } = await speakViaTtsHttp(
          "/api/tts/elevenlabs",
          line,
          activeAudioRef,
          activeUrlRef,
          isPlayingRef,
          ac.signal,
          utteranceEpoch,
          utteranceEpochRef,
        );

        let success = primarySuccess;
        let secondaryRetryAfter: number | null = null;
        let secondaryRateLimited = false;
        if (
          !success
          && !skipSecondaryCloud
          && isPlayingRef.current
          && utteranceEpoch === utteranceEpochRef.current
        ) {
          const second = await speakViaTtsHttp(
            "/api/tts/openai",
            line,
            activeAudioRef,
            activeUrlRef,
            isPlayingRef,
            ac.signal,
            utteranceEpoch,
            utteranceEpochRef,
          );
          success = second.success;
          secondaryRateLimited = second.rateLimited;
          secondaryRetryAfter = second.retryAfterSeconds;
        }

        if (
          (primaryRateLimited || secondaryRateLimited)
          && utteranceEpoch === utteranceEpochRef.current
        ) {
          const untilMs = [primaryRetryAfter, secondaryRetryAfter].flatMap(
            (sec) => {
              if (sec == null || !Number.isFinite(sec) || sec < 0) return [];
              return [Date.now() + Math.ceil(sec) * 1000];
            },
          );
          const cooldownUntilMs =
            untilMs.length > 0 ? Math.max(...untilMs) : undefined;
          dispatch({
            type: "SET_ASSISTANT_WARNING",
            payload: {
              message: TTS_RATE_LIMIT_WARNING,
              ...(cooldownUntilMs != null ? { cooldownUntilMs } : {}),
            },
          });
        }

        if (
          !success
          && isPlayingRef.current
          && utteranceEpoch === utteranceEpochRef.current
        ) {
          await speakViaWebSpeech(line, voices, cfg);
        }
      } finally {
        if (ttsFetchAbortRef.current === ac) ttsFetchAbortRef.current = null;
      }

      if (utteranceEpoch === utteranceEpochRef.current) {
        setIsSpeaking(false);
      }
    },
    [voices, cfg, dispatch]
  );

  const playDialogue = useCallback(
    async (lines: DialogueLine[]) => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;
      for (let i = 0; i < lines.length; i++) {
        if (!isPlayingRef.current) break;
        await speakLine(lines[i]);
        if (i < lines.length - 1) {
          advanceLine();
          await new Promise((r) => setTimeout(r, cfg.interLinePauseMs));
        }
      }
      isPlayingRef.current = false;
    },
    [speakLine, advanceLine, cfg.interLinePauseMs]
  );

  const stop = useCallback(() => {
    ttsFetchAbortRef.current?.abort();
    ttsFetchAbortRef.current = null;
    utteranceEpochRef.current += 1;
    isPlayingRef.current = false;
    const a = activeAudioRef.current;
    if (a) {
      a.pause();
      try {
        a.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    activeAudioRef.current = null;
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const spokenLineRef = useRef<DialogueLine | undefined>(undefined);
  const autoplayRef = useRef(state.autoplayEnabled);
  autoplayRef.current = state.autoplayEnabled;

  useEffect(() => {
    if (!state.voiceEnabled || !state.currentDialogue || !state.isOpen) {
      spokenLineRef.current = undefined;
      return;
    }

    const line = state.currentDialogue.lines[state.currentLineIndex];
    // Streaming / gear-switch clears lines before new content arrives — stop old audio.
    if (!line) {
      spokenLineRef.current = undefined;
      stop();
      return;
    }
    if (line === spokenLineRef.current) return;

    spokenLineRef.current = line;
    stop();
    const epochAtStart = utteranceEpochRef.current;
    isPlayingRef.current = true;
    speakLine(line).then(() => {
      if (epochAtStart !== utteranceEpochRef.current) return;
      isPlayingRef.current = false;
      if (autoplayRef.current) {
        advanceLine();
      }
    });
  }, [
    state.voiceEnabled,
    state.isOpen,
    state.currentDialogue,
    state.currentLineIndex,
    speakLine,
    stop,
    advanceLine,
  ]);

  useEffect(() => {
    if (!state.currentDialogue && isSpeaking) stop();
  }, [state.currentDialogue, isSpeaking, stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { isSupported, isSpeaking, playDialogue, stop, voices };
}
