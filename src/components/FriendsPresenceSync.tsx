"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { upsertUserPresence } from "@/lib/supabase/friends";

function getCurrentGameSlug(pathname: string): string | null {
  const match = pathname.match(/^\/games\/([^/]+)/);
  return match?.[1] ?? null;
}

export default function FriendsPresenceSync() {
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    const gameSlug = getCurrentGameSlug(pathname);

    const markOnline = () => {
      if (!active) return;
      void upsertUserPresence({ isOnline: true, currentGameSlug: gameSlug });
    };

    const markOffline = () => {
      if (!active) return;
      void upsertUserPresence({ isOnline: false, currentGameSlug: null });
    };

    markOnline();

    const interval = window.setInterval(markOnline, 45000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") markOnline();
      else markOffline();
    };
    const onBeforeUnload = () => markOffline();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      void upsertUserPresence({ isOnline: false, currentGameSlug: null });
    };
  }, [pathname]);

  return null;
}
