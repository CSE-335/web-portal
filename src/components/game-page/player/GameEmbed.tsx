import { Box } from "@mantine/core";
import { useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type GameEmbedProps = {
  src: string;
  title: string;
  height?: string;
  slug: string;
};

export default function GameEmbed({
  src,
  title,
  height = "800px",
  slug,
}: GameEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameOrigin = useMemo(() => {
    try {
      return new URL(src, typeof window !== "undefined" ? window.location.href : "http://localhost").origin;
    } catch {
      return "*";
    }
  }, [src]);

  useEffect(() => {
    let latestGameData: unknown = {};

    async function getAuthHeaders() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        return null;
      }
      return { Authorization: `Bearer ${accessToken}` };
    }

    async function loadGameData() {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders) {
        // Guest or session not ready yet — skip cloud sync (no unhandled rejection).
        latestGameData = {};
        iframeRef.current?.contentWindow?.postMessage(
          { type: "PORTAL_GAME_DATA_LOADED", payload: latestGameData },
          gameOrigin
        );
        return;
      }

      const loadResponse = await fetch(`/api/game-data/${slug}`, {
        method: "GET",
        credentials: "include",
        headers: authHeaders,
      });
      const loadJson = (await loadResponse.json().catch(() => null)) as
        | { ok?: boolean; gameData?: unknown; fallbackUsed?: boolean }
        | null;

      if (!loadResponse.ok || !loadJson?.ok) {
        return;
      }

      latestGameData = loadJson.gameData ?? {};

      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "PORTAL_GAME_DATA_LOADED",
          payload: latestGameData,
        },
        gameOrigin
      );

      // Ensure first-time users get a row tied to this user+game.
      if (loadJson.fallbackUsed) {
        const authHeaders = await getAuthHeaders();
        if (!authHeaders) {
          return;
        }

        await fetch(`/api/game-data/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          credentials: "include",
          body: JSON.stringify({ data: latestGameData }),
        });
      }
    }

    function handleGameMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data as
        | { source?: string; type?: string; payload?: unknown; requestId?: number | string }
        | undefined;

      if (!data?.type) return;

      if (data.type === "PORTAL_GAME_DATA_SAVE") {
        latestGameData = data.payload ?? {};
        void (async () => {
          const authHeaders = await getAuthHeaders();
          if (!authHeaders) {
            return;
          }

          await fetch(`/api/game-data/${slug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders },
            credentials: "include",
            body: JSON.stringify({ data: latestGameData }),
          });
        })();
      }

      if (data.type === "PORTAL_GAME_DATA_LOAD_REQUEST") {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "PORTAL_GAME_DATA_LOADED",
            payload: latestGameData,
          },
          gameOrigin
        );
      }

      // Generic request/response bridge for any game-specific `source`.
      if (typeof data.source === "string" && data.type === "getGameData" && data.requestId != null) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            source: data.source,
            requestId: data.requestId,
            payload: latestGameData,
          },
          gameOrigin
        );
      }

      if (typeof data.source === "string" && data.type === "saveGameData" && data.requestId != null) {
        const payloadData = (data.payload as { data?: unknown } | undefined)?.data ?? data.payload ?? {};
        latestGameData = payloadData;

        void (async () => {
          const authHeaders = await getAuthHeaders();
          if (!authHeaders) {
            iframeRef.current?.contentWindow?.postMessage(
              {
                source: data.source,
                requestId: data.requestId,
                error: "Not authenticated",
              },
              gameOrigin
            );
            return;
          }

          const saveResponse = await fetch(`/api/game-data/${slug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders },
            credentials: "include",
            body: JSON.stringify({ data: payloadData }),
          });

          if (!saveResponse.ok) {
            const saveBody = (await saveResponse.json().catch(() => null)) as
              | { details?: string; error?: string }
              | null;
            iframeRef.current?.contentWindow?.postMessage(
              {
                source: data.source,
                requestId: data.requestId,
                error: saveBody?.details ?? saveBody?.error ?? "Failed to save game data",
              },
              gameOrigin
            );
            return;
          }

          iframeRef.current?.contentWindow?.postMessage(
            {
              source: data.source,
              requestId: data.requestId,
              payload: { ok: true },
            },
            gameOrigin
          );
        })();
      }
    }

    void loadGameData();
    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, [slug, gameOrigin]);

  return (
    <Box style={{ overflow: "hidden", borderRadius: 20, background: "rgba(0,0,0,0.2)" }}>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        style={{ display: "block", width: "100%", height, border: 0 }}
        allow="microphone; autoplay"
        allowFullScreen
      />
    </Box>
  );
}
