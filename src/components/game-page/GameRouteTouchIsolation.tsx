"use client";

import { type ReactNode, useEffect } from "react";

const HTML_BODY_CLASS = "game-route-touch-isolation";

/**
 * While on /games/*, tighten browser defaults so iframe drag/touch gestures are less likely to
 * fight page rubber-banding, scroll chaining, and pull-to-refresh (host side only — games still
 * need Pointer Events per MOBILE_EMBED_GAME_GUIDE.md).
 */
export default function GameRouteTouchIsolation({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add(HTML_BODY_CLASS);
    document.body.classList.add(HTML_BODY_CLASS);
    return () => {
      document.documentElement.classList.remove(HTML_BODY_CLASS);
      document.body.classList.remove(HTML_BODY_CLASS);
    };
  }, []);

  return <>{children}</>;
}
