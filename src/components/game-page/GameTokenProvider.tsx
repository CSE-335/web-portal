"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes

export default function GameTokenProvider() {
  useEffect(() => {
    function refreshToken() {
      fetch("/api/auth/game-token").catch(() => {
        // Silently fail — dev mode or token service unavailable
      });
    }

    // Fetch token immediately on mount
    refreshToken();

    // Refresh before expiry (token lasts 15 min, refresh every 12 min)
    const interval = setInterval(refreshToken, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
