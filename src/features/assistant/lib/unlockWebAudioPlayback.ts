// ============================================================================
// Best-effort iOS Safari / autoplay unblock: resume AudioContext from a gesture.
// Subsequent async HTMLAudio.play() calls for TTS are much more reliable after a
// same-tab user interaction (toolbar "Ask tutors", etc.).
// ============================================================================

let sharedCtx: AudioContext | null = null;
/** One inaudible graph tick — enough for some engines to mark audio "unlocked". */
let didPrimeOutput = false;

/** Call from user gestures (toolbar, dialogue tap). Safe to call often: resumes; primes once. */
export function unlockWebAudioPlayback(): void {
  if (typeof window === "undefined") return;

  try {
    type WinAudio = Window & { webkitAudioContext?: typeof AudioContext };
    const win = window as WinAudio;
    const AC = globalThis.AudioContext ?? win.webkitAudioContext;
    if (!AC) return;

    if (!sharedCtx || sharedCtx.state === "closed") {
      sharedCtx = new AC();
    }

    void sharedCtx.resume();

    if (didPrimeOutput) return;
    didPrimeOutput = true;

    const oscillator = sharedCtx.createOscillator();
    const gain = sharedCtx.createGain();
    gain.gain.value = 1e-4;
    oscillator.connect(gain).connect(sharedCtx.destination);
    const t0 = sharedCtx.currentTime;
    oscillator.start(t0);
    oscillator.stop(t0 + 0.02);
  } catch {
    /* best-effort */
  }
}
