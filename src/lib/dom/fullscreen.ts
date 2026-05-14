/** Document / element vendor typings for legacy Fullscreen API. */
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

const FULLSCREEN_CHANGE_EVENTS = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
  "MSFullscreenChange",
] as const;

export function getFullscreenElement(): Element | null {
  const d = document as FullscreenDocument;
  return (
    document.fullscreenElement ??
    d.webkitFullscreenElement ??
    d.mozFullScreenElement ??
    d.msFullscreenElement ??
    null
  );
}

/** Requests fullscreen using standard + vendor-prefixed APIs; resolves when unsupported or after attempt. */
export function requestFullscreenElement(el: HTMLElement | null): Promise<void> {
  if (!el) return Promise.resolve();

  const n = el as FullscreenElement;
  const ret =
    n.requestFullscreen?.() ??
    n.webkitRequestFullscreen?.() ??
    n.mozRequestFullScreen?.() ??
    n.msRequestFullscreen?.();

  if (ret != null && typeof (ret as Promise<void>).then === "function") {
    return (ret as Promise<void>).catch(() => {});
  }
  return Promise.resolve();
}

export function exitFullscreenDocument(): Promise<void> {
  const d = document as FullscreenDocument;
  if (!getFullscreenElement()) return Promise.resolve();

  const ret =
    document.exitFullscreen?.() ??
    d.webkitExitFullscreen?.() ??
    d.mozCancelFullScreen?.() ??
    d.msExitFullscreen?.();

  if (ret != null && typeof (ret as Promise<void>).then === "function") {
    return (ret as Promise<void>).catch(() => {});
  }
  return Promise.resolve();
}

export function addFullscreenChangeListener(handler: () => void): () => void {
  const wrapped = () => handler();
  for (const ev of FULLSCREEN_CHANGE_EVENTS) {
    document.addEventListener(ev, wrapped);
  }
  return () => {
    for (const ev of FULLSCREEN_CHANGE_EVENTS) {
      document.removeEventListener(ev, wrapped);
    }
  };
}

type OrientableScreen = Screen & {
  orientation?: ScreenOrientation & {
    lock?: (orientation: string) => Promise<void>;
    unlock?: () => void;
  };
};

/**
 * Best-effort landscape lock (common on Android Chrome after a user gesture; often unsupported on iOS Safari).
 * Returns true if `lock` was invoked and resolved.
 */
export async function lockLandscapePrimary(): Promise<boolean> {
  try {
    const o = (screen as OrientableScreen).orientation;
    if (o?.lock) {
      await o.lock("landscape-primary");
      return true;
    }
  } catch {
    // Not supported, permission denied, or not active user gesture
  }
  return false;
}

export function unlockScreenOrientation(): void {
  try {
    (screen as OrientableScreen).orientation?.unlock?.();
  } catch {
    // noop
  }
}

/** True when the page runs as an installed PWA / “Add to Home Screen” web app. */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  } catch {
    /* noop */
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

/**
 * Phone-like viewport in **either** orientation: landscape has a wide width but a short height
 * (e.g. 844×390), so width-only breakpoints miss and iOS falls through to element fullscreen, which fails.
 */
export const MOBILE_IMMERSIVE_VIEWPORT_MQ = "(max-width: 767px), (max-height: 767px)";

export function matchesMobileImmersiveViewport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia(MOBILE_IMMERSIVE_VIEWPORT_MQ).matches;
  } catch {
    return false;
  }
}

/** When set on `document.body`, site chrome is hidden while the player is truly fullscreen-like. */
export const GAME_IMMERSIVE_UI_BODY_CLASS = "game-immersive-ui-active";

