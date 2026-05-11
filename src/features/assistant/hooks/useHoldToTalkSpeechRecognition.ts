"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** Shapes for Web Speech API events (not always in TS `lib` for this project). */
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}

interface SpeechRecognitionResultEventLike extends Event {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message: string;
}

/** Minimal typing; DOM lib coverage for SpeechRecognition varies by TS target. */
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
}

function getSpeechRecognitionCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() != null;
}

export interface UseHoldToTalkSpeechRecognitionOptions {
  /** Called on every interim/final chunk with the dictated segment only (no base prefix). */
  onDictationSegment: (segment: string) => void;
  disabled?: boolean;
}

export interface HoldPointerHandlers {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
}

/**
 * Press-and-hold speech-to-text using the browser Web Speech API.
 * Streams partial transcripts via interim results while the pointer is held.
 */
export function useHoldToTalkSpeechRecognition(
  options: UseHoldToTalkSpeechRecognitionOptions,
): {
  supported: boolean;
  listening: boolean;
  lastError: string | null;
  holdHandlers: HoldPointerHandlers;
} {
  const { onDictationSegment, disabled } = options;
  const onDictationRef = useRef(onDictationSegment);

  const [supported] = useState(() => isBrowserSpeechRecognitionSupported());
  const [listening, setListening] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalBufferRef = useRef("");
  const holdingRef = useRef(false);
  const captureTargetRef = useRef<HTMLElement | null>(null);

  const tearDownRecognition = useCallback(() => {
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
    }
    finalBufferRef.current = "";
  }, []);

  useEffect(() => {
    onDictationRef.current = onDictationSegment;
  }, [onDictationSegment]);

  useEffect(() => () => tearDownRecognition(), [tearDownRecognition]);

  const startRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || disabled) return;

    tearDownRecognition();
    setLastError(null);
    finalBufferRef.current = "";

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const row = event.results[i];
        const piece = row[0]?.transcript ?? "";
        if (row.isFinal) {
          finalBufferRef.current += piece;
        } else {
          interim += piece;
        }
      }
      onDictationRef.current(finalBufferRef.current + interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        holdingRef.current = false;
      }
      setLastError(event.message || event.error || "Speech recognition error");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (!holdingRef.current) {
        setListening(false);
      } else {
        try {
          const next = new Ctor();
          next.continuous = true;
          next.interimResults = true;
          next.lang = recognition.lang;
          next.maxAlternatives = 1;
          next.onresult = recognition.onresult;
          next.onerror = recognition.onerror;
          next.onend = recognition.onend;
          recognitionRef.current = next;
          next.start();
        } catch {
          setListening(false);
          holdingRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      recognitionRef.current = null;
      setLastError("Could not start microphone");
    }
  }, [disabled, tearDownRecognition]);

  const stopRecognition = useCallback(() => {
    holdingRef.current = false;
    const r = recognitionRef.current;
    if (r) {
      try {
        r.stop();
      } catch {
        tearDownRecognition();
        setListening(false);
      }
    } else {
      setListening(false);
    }
  }, [tearDownRecognition]);

  const holdHandlers = useMemoHoldHandlers({
    disabled,
    supported,
    startRecognition,
    stopRecognition,
    holdingRef,
    captureTargetRef,
  });

  return { supported, listening, lastError, holdHandlers };
}

function useMemoHoldHandlers(params: {
  disabled: boolean | undefined;
  supported: boolean;
  startRecognition: () => void;
  stopRecognition: () => void;
  holdingRef: MutableRefObject<boolean>;
  captureTargetRef: MutableRefObject<HTMLElement | null>;
}): HoldPointerHandlers {
  const {
    disabled,
    supported,
    startRecognition,
    stopRecognition,
    holdingRef,
    captureTargetRef,
  } = params;

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!supported || disabled || e.button !== 0) return;
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      captureTargetRef.current = el;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      holdingRef.current = true;
      startRecognition();
    },
    [supported, disabled, startRecognition, holdingRef, captureTargetRef],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (!supported) return;
      const el = e.currentTarget as HTMLElement;
      if (captureTargetRef.current === el) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        captureTargetRef.current = null;
      }
      stopRecognition();
    },
    [supported, stopRecognition, captureTargetRef],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent) => {
      onPointerUp(e);
    },
    [onPointerUp],
  );

  return useMemo(
    () => ({ onPointerDown, onPointerUp, onPointerCancel }),
    [onPointerDown, onPointerUp, onPointerCancel],
  );
}
