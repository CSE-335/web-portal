// ============================================================================
// Text-to-speech: ElevenLabs via /api/tts (primary), Web Speech API (fallback).
// ============================================================================

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// ---------------------------------------------------------------------------
// ElevenLabs via /api/tts
// ---------------------------------------------------------------------------

async function speakViaElevenLabs(
  line: DialogueLine,
  activeAudioRef: React.MutableRefObject<HTMLAudioElement | null>,
  activeUrlRef: React.MutableRefObject<string | null>,
  isPlayingRef: React.MutableRefObject<boolean>,
): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: line.text, speaker: line.speaker }),
    });

    if (!res.ok) return false;
    if (!isPlayingRef.current) return false;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    activeUrlRef.current = url;

    return new Promise<boolean>((resolve) => {
      if (!isPlayingRef.current) {
        URL.revokeObjectURL(url);
        activeUrlRef.current = null;
        return resolve(false);
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
      audio.onended = () => { cleanup(); resolve(true); };
      audio.onerror = () => { cleanup(); resolve(false); };
      audio.play().catch(() => { cleanup(); resolve(false); });
    });
  } catch {
    return false;
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
  const { state, advanceLine } = useAssistant();
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

      const ok = await speakViaElevenLabs(line, activeAudioRef, activeUrlRef, isPlayingRef);
      if (!ok && isPlayingRef.current) {
        await speakViaWebSpeech(line, voices, cfg);
      }

      setIsSpeaking(false);
    },
    [voices, cfg]
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
    isPlayingRef.current = false;
    activeAudioRef.current?.pause();
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
    if (!state.voiceEnabled || !state.currentDialogue) {
      spokenLineRef.current = undefined;
      return;
    }

    const line = state.currentDialogue.lines[state.currentLineIndex];
    if (!line || line === spokenLineRef.current) return;

    spokenLineRef.current = line;
    stop();
    isPlayingRef.current = true;
    speakLine(line).then(() => {
      isPlayingRef.current = false;
      if (autoplayRef.current) {
        advanceLine();
      }
    });
  }, [state.voiceEnabled, state.currentDialogue, state.currentLineIndex, speakLine, stop, advanceLine]);

  useEffect(() => {
    if (!state.currentDialogue && isSpeaking) stop();
  }, [state.currentDialogue, isSpeaking, stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { isSupported, isSpeaking, playDialogue, stop, voices };
}
