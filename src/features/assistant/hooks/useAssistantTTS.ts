// ============================================================================
// Text-to-speech: ElevenLabs (/api/tts/elevenlabs) → OpenAI (/api/tts/openai) → Web Speech API.
//
// Prefetch strategy: while line N is playing, we background-fetch the audio
// for line N+1. When the user advances, the blob is already in memory and
// plays instantly instead of waiting for a 1-2 s round-trip.
// ============================================================================

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseRetryAfterSeconds } from "@/lib/parseRetryAfter";
import { useAssistant } from "../AssistantContext";
import type { AssistantResponse, DialogueLine } from "../types";

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
// Audio prefetch cache
// ---------------------------------------------------------------------------

function audioCacheKey(line: DialogueLine): string {
  return `${line.speaker}::${line.text}`;
}

const TTS_ENDPOINTS = ["/api/tts/elevenlabs", "/api/tts/openai"] as const;

/**
 * Fetches the audio blob for a line and stores it in `cache`. Tries each
 * cloud TTS endpoint in order, stops at the first success. Purely
 * background — errors are silently ignored.
 */
async function prefetchAudioBlob(
  line: DialogueLine,
  cache: Map<string, Blob>,
  signal: AbortSignal,
): Promise<void> {
  const key = audioCacheKey(line);
  if (cache.has(key)) return;

  for (const apiPath of TTS_ENDPOINTS) {
    if (signal.aborted) return;
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: line.text, speaker: line.speaker }),
        signal,
      });
      if (signal.aborted) return;
      if (res.ok) {
        const blob = await res.blob();
        if (!signal.aborted) cache.set(key, blob);
        return;
      }
    } catch {
      if (signal.aborted) return;
    }
  }
}

// ---------------------------------------------------------------------------
// MP3 from /api/tts/elevenlabs (ElevenLabs) or /api/tts/openai (OpenAI)
// ---------------------------------------------------------------------------

function isStaleUtterance(
  utteranceEpoch: number,
  epochRef: React.MutableRefObject<number>,
): boolean {
  return utteranceEpoch !== epochRef.current;
}

interface SpeakViaTtsHttpParams {
  apiPath: string;
  line: DialogueLine;
  activeAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  activeUrlRef: React.MutableRefObject<string | null>;
  isPlayingRef: React.MutableRefObject<boolean>;
  signal: AbortSignal;
  utteranceEpoch: number;
  epochRef: React.MutableRefObject<number>;
  /** Fired exactly once when audio.play() actually begins producing sound. */
  onAudioStarted?: () => void;
  /** Pre-fetched blob — if provided the network fetch is skipped entirely. */
  cachedBlob?: Blob;
}

async function speakViaTtsHttp(
  params: SpeakViaTtsHttpParams,
): Promise<TtsHttpAudioOutcome> {
  const {
    apiPath,
    line,
    activeAudioRef,
    activeUrlRef,
    isPlayingRef,
    signal,
    utteranceEpoch,
    epochRef,
    onAudioStarted,
    cachedBlob,
  } = params;

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
    let blob: Blob;

    if (cachedBlob) {
      // Fast path — blob was already prefetched.
      if (isStaleUtterance(utteranceEpoch, epochRef) || signal.aborted) {
        return fail();
      }
      if (!isPlayingRef.current) return fail();
      blob = cachedBlob;
    } else {
      // Normal network path.
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
          rateLimited &&
          res.headers.get("x-tts-limited-by")?.toLowerCase() === "upstash";
        const retryAfterSeconds = rateLimited
          ? parseRetryAfterSeconds(res)
          : null;
        return fail(rateLimited, skipSecondaryCloud, retryAfterSeconds);
      }
      if (!isPlayingRef.current) return fail();

      blob = await res.blob();
      if (isStaleUtterance(utteranceEpoch, epochRef) || signal.aborted) {
        return fail();
      }
    }

    // Blob → Audio element → play.
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

      let started = false;
      const markStarted = () => {
        if (started) return;
        started = true;
        onAudioStarted?.();
      };

      audio.onplaying = markStarted;
      audio.onended = () => {
        cleanup();
        resolve(ok());
      };
      audio.onerror = () => {
        cleanup();
        resolve(fail());
      };
      audio
        .play()
        .then(() => {
          markStarted();
        })
        .catch(() => {
          cleanup();
          resolve(fail());
        });
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
  cfg: Required<TTSConfig>,
  onAudioStarted?: () => void,
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      onAudioStarted?.();
      return resolve();
    }
    const u = new SpeechSynthesisUtterance(line.text);

    const hint =
      line.speaker === "Laurie" ? cfg.laurieVoiceHint : cfg.livvyVoiceHint;
    const voice =
      voices.find((v) => v.name.includes(hint) && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;

    u.rate = cfg.rate;
    u.pitch = line.speaker === "Laurie" ? cfg.lauriePitch : cfg.livvyPitch;

    let started = false;
    const markStarted = () => {
      if (started) return;
      started = true;
      onAudioStarted?.();
    };

    u.onstart = markStarted;
    u.onend = () => {
      markStarted();
      resolve();
    };
    u.onerror = () => {
      markStarted();
      resolve();
    };
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
    [
      config?.rate,
      config?.lauriePitch,
      config?.livvyPitch,
      config?.laurieVoiceHint,
      config?.livvyVoiceHint,
      config?.interLinePauseMs,
    ],
  );
  const isPlayingRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  /** Bumped in `stop()` so in-flight TTS (fetch/audio) cannot overlap the next line. */
  const utteranceEpochRef = useRef(0);
  const ttsFetchAbortRef = useRef<AbortController | null>(null);

  // ---- Prefetch cache & in-flight tracking ----------------------------
  // Audio blobs by line key, populated by background prefetches.
  const audioCacheRef = useRef(new Map<string, Blob>());
  // In-flight prefetches by line key. We track each one independently so
  // starting a prefetch for line N+2 does NOT abort the prefetch for N+1.
  const inFlightPrefetchesRef = useRef(
    new Map<string, { ac: AbortController; promise: Promise<void> }>(),
  );

  useEffect(() => {
    const hasWebSpeech =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setIsSupported(hasWebSpeech);

    if (!hasWebSpeech) return;

    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  /** Clear the audio-buffer flag exactly once per call site. */
  const clearAudioBuffer = useCallback(() => {
    dispatch({ type: "SET_AUDIO_BUFFERING", payload: false });
  }, [dispatch]);

  /**
   * Kick off a background prefetch for a line. Multiple prefetches may run
   * concurrently — we never abort an in-flight prefetch because of a sibling.
   * Already-cached or already-in-flight lines are no-ops.
   */
  const prefetchLine = useCallback((line: DialogueLine) => {
    const key = audioCacheKey(line);
    if (audioCacheRef.current.has(key)) return;
    if (inFlightPrefetchesRef.current.has(key)) return;

    const ac = new AbortController();
    const promise = prefetchAudioBlob(
      line,
      audioCacheRef.current,
      ac.signal,
    ).finally(() => {
      // Remove ourselves from the in-flight map only if we're still the
      // entry for this key (defensive — never happens in practice because
      // we early-return above on duplicate calls).
      const entry = inFlightPrefetchesRef.current.get(key);
      if (entry?.ac === ac) inFlightPrefetchesRef.current.delete(key);
    });
    inFlightPrefetchesRef.current.set(key, { ac, promise });
  }, []);

  /** Prefetch every upcoming line in a dialogue, in parallel. */
  const prefetchUpcoming = useCallback(
    (dialogue: AssistantResponse, fromIndex: number) => {
      for (let i = fromIndex; i < dialogue.lines.length; i++) {
        prefetchLine(dialogue.lines[i]);
      }
    },
    [prefetchLine],
  );

  /** Abort and clear every in-flight prefetch (used on dialogue change / unmount). */
  const cancelAllPrefetches = useCallback(() => {
    for (const { ac } of inFlightPrefetchesRef.current.values()) {
      ac.abort();
    }
    inFlightPrefetchesRef.current.clear();
  }, []);

  const speakLine = useCallback(
    async (
      line: DialogueLine,
      options?: { onAudioStarted?: () => void },
    ): Promise<void> => {
      setIsSpeaking(true);

      const utteranceEpoch = utteranceEpochRef.current;
      const ac = new AbortController();
      ttsFetchAbortRef.current = ac;

      // Check prefetch cache — consume entry so stale blobs don't linger.
      const cacheKey = audioCacheKey(line);
      let cachedBlob = audioCacheRef.current.get(cacheKey);

      // Cache miss but a prefetch IS in flight → wait for it instead of
      // starting a duplicate fetch. This is the key fix for the click-fast
      // lag: when the user advances before the prefetch finishes, we await
      // the existing prefetch (almost done) rather than starting a fresh
      // 1-2 s round trip.
      if (!cachedBlob) {
        const inFlight = inFlightPrefetchesRef.current.get(cacheKey);
        if (inFlight) {
          await inFlight.promise;
          if (isStaleUtterance(utteranceEpoch, utteranceEpochRef)) return;
          cachedBlob = audioCacheRef.current.get(cacheKey);
        }
      }
      if (cachedBlob) audioCacheRef.current.delete(cacheKey);

      let signaledStart = false;
      const onAudioStarted = () => {
        if (signaledStart) return;
        signaledStart = true;
        options?.onAudioStarted?.();
      };

      try {
        const {
          success: primarySuccess,
          rateLimited: primaryRateLimited,
          skipSecondaryCloud,
          retryAfterSeconds: primaryRetryAfter,
        } = await speakViaTtsHttp({
          apiPath: "/api/tts/elevenlabs",
          line,
          activeAudioRef,
          activeUrlRef,
          isPlayingRef,
          signal: ac.signal,
          utteranceEpoch,
          epochRef: utteranceEpochRef,
          onAudioStarted,
          cachedBlob,
        });

        let success = primarySuccess;
        let secondaryRetryAfter: number | null = null;
        let secondaryRateLimited = false;
        if (
          !success &&
          !skipSecondaryCloud &&
          isPlayingRef.current &&
          utteranceEpoch === utteranceEpochRef.current
        ) {
          const second = await speakViaTtsHttp({
            apiPath: "/api/tts/openai",
            line,
            activeAudioRef,
            activeUrlRef,
            isPlayingRef,
            signal: ac.signal,
            utteranceEpoch,
            epochRef: utteranceEpochRef,
            onAudioStarted,
            // No cache for the secondary tier — the prefetch already tried both.
          });
          success = second.success;
          secondaryRateLimited = second.rateLimited;
          secondaryRetryAfter = second.retryAfterSeconds;
        }

        if (
          (primaryRateLimited || secondaryRateLimited) &&
          utteranceEpoch === utteranceEpochRef.current
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
          !success &&
          isPlayingRef.current &&
          utteranceEpoch === utteranceEpochRef.current
        ) {
          await speakViaWebSpeech(line, voices, cfg, onAudioStarted);
        }
      } finally {
        if (ttsFetchAbortRef.current === ac) ttsFetchAbortRef.current = null;
        if (!signaledStart) onAudioStarted();
      }

      if (utteranceEpoch === utteranceEpochRef.current) {
        setIsSpeaking(false);
      }
    },
    [voices, cfg, dispatch],
  );

  const playDialogue = useCallback(
    async (lines: DialogueLine[]) => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;
      for (let i = 0; i < lines.length; i++) {
        if (!isPlayingRef.current) break;
        // Prefetch the upcoming line while we speak the current one.
        if (i + 1 < lines.length) prefetchLine(lines[i + 1]);
        await speakLine(lines[i]);
        if (i < lines.length - 1) {
          advanceLine();
          await new Promise((r) => setTimeout(r, cfg.interLinePauseMs));
        }
      }
      isPlayingRef.current = false;
    },
    [speakLine, advanceLine, cfg.interLinePauseMs, prefetchLine],
  );

  const stop = useCallback(() => {
    // Abort the in-flight TTS fetch (for the current line being spoken).
    ttsFetchAbortRef.current?.abort();
    ttsFetchAbortRef.current = null;
    // Do NOT abort the prefetch — it's fetching the NEXT line's audio. If the
    // user is clicking quickly to advance, we want that blob to finish so the
    // next line can play instantly from cache.
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
  const spokenDialogueRef = useRef<AssistantResponse | null>(null);
  const autoplayRef = useRef(state.autoplayEnabled);
  autoplayRef.current = state.autoplayEnabled;

  useEffect(() => {
    if (!state.currentDialogue || !state.isOpen) {
      spokenLineRef.current = undefined;
      spokenDialogueRef.current = null;
      stop();
      cancelAllPrefetches();
      audioCacheRef.current.clear();
      if (state.isAudioBuffering) clearAudioBuffer();
      return;
    }

    if (!state.voiceEnabled) {
      spokenDialogueRef.current = state.currentDialogue;
      spokenLineRef.current =
        state.currentDialogue.lines[state.currentLineIndex];
      stop();
      cancelAllPrefetches();
      audioCacheRef.current.clear();
      if (state.isAudioBuffering) clearAudioBuffer();
      return;
    }

    const line = state.currentDialogue.lines[state.currentLineIndex];
    if (!line) {
      spokenLineRef.current = undefined;
      stop();
      return;
    }
    if (line === spokenLineRef.current) return;

    const isFirstLineOfNewDialogue =
      spokenDialogueRef.current !== state.currentDialogue &&
      state.currentLineIndex === 0;

    // When the dialogue identity changes, invalidate the entire cache
    // and cancel any in-flight prefetches from the previous exchange.
    if (spokenDialogueRef.current !== state.currentDialogue) {
      cancelAllPrefetches();
      audioCacheRef.current.clear();
    }

    spokenLineRef.current = line;
    spokenDialogueRef.current = state.currentDialogue;
    stop();
    const epochAtStart = utteranceEpochRef.current;
    isPlayingRef.current = true;

    // Prefetch ALL upcoming lines in parallel (dialogues are short, ~2-6 lines).
    // This means even if the player clicks rapidly through the dialogue, the
    // audio for the line they jump to is almost always already cached.
    prefetchUpcoming(state.currentDialogue, state.currentLineIndex + 1);

    speakLine(line, {
      onAudioStarted: isFirstLineOfNewDialogue ? clearAudioBuffer : undefined,
    }).then(() => {
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
    state.isAudioBuffering,
    speakLine,
    stop,
    advanceLine,
    clearAudioBuffer,
    prefetchUpcoming,
    cancelAllPrefetches,
  ]);

  useEffect(() => {
    if (!state.currentDialogue && isSpeaking) stop();
  }, [state.currentDialogue, isSpeaking, stop]);

  useEffect(() => {
    const audioCache = audioCacheRef.current;
    return () => {
      stop();
      cancelAllPrefetches();
      audioCache.clear();
    };
  }, [stop, cancelAllPrefetches]);

  return { isSupported, isSpeaking, playDialogue, stop, voices };
}
