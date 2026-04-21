# How to Add Game Data Persistence

This guide explains how embedded games should send/receive user progress data through the portal.

The portal owns authentication and database access. Games communicate with the portal through `postMessage`.

---

## Overview

Current data flow:

1. User opens `/games/[slug]` in the portal.
2. Portal embeds the game in an iframe.
3. Portal loads current `game_data.data_json` for `(user, game)`.
4. Portal sends that JSON into the iframe.
5. Game sends save requests/messages back to portal.
6. Portal writes updates to `game_data.data_json`.

The game does **not** talk to Supabase directly.

---

## Database Contract

`game_data` rows are expected to look like:

- `id`
- `user_id` (maps to `user_profiles.id`)
- `game_id` (maps to `games.id`)
- `data_json` (jsonb payload for this game)
- `created_at`
- `updated_at`

`data_json` can be any game-specific shape, for example:

```json
{
  "questions_asked": 2,
  "last_motion": "walking",
  "checkpoints": ["intro", "challenge1"]
}
```

---

## Portal-Side API

The portal route used by the iframe bridge is:

- `GET /api/game-data/[slug]`
- `PUT /api/game-data/[slug]`

Implementation location:

- `src/app/api/game-data/[slug]/route.ts`

Behavior:

- Resolves authenticated user (cookie or bearer token).
- Resolves `games.id` from `slug`.
- Resolves profile from `user_profiles.auth_user_id`.
- Reads/writes `game_data.data_json`.
- Returns fallback `{}` when no row exists yet.

---

## Portal-Side Iframe Bridge

Implementation location:

- `src/components/game-page/player/GameEmbed.tsx`

The bridge supports Protocol A (`PORTAL_*`) for game data persistence.

### Protocol A: `PORTAL_*` (standard)

Game -> Portal:

- `PORTAL_GAME_DATA_LOAD_REQUEST`
- `PORTAL_GAME_DATA_SAVE` with `payload` as JSON data

Portal -> Game:

- `PORTAL_GAME_DATA_LOADED` with `payload` as JSON data

---

## End-to-End Example: Increment a Counter

Goal: every answered question increments `questions_asked`.

Pattern (with `usePortalGameData`):

1. Read current JSON from hook state:
   - `const questionsAsked = Number(data.questions_asked ?? 0)`
2. Compute next value:
   - `next = questionsAsked + 1`
3. Persist merged JSON:
   - `mergeAndPersist({ questions_asked: next })`

This keeps game code minimal while preserving additive updates.

---

## Local Development Checklist

1. Game appears in metadata:
   - `src/data/games.ts` has your game slug.
2. Games table is seeded:
   - Run `npm run setup-games` (this now seeds automatically), or `npm run seed-games`.
3. User is authenticated in portal.
4. User has a `user_profiles` row.
5. Game is staged in portal static path:
   - `public/staticGames/<game-id>/...`
6. After game code changes, rebuild and restage:
   - `npm --prefix games/<game-folder> run build`
   - copy `dist` into `public/staticGames/<game-id>`

If step 6 is skipped, portal serves stale JS and your new save logic will not run.

---

## Common Errors and Fixes

### `GET /api/game-data/undefined`

Cause:
- Missing `slug` prop passed to game player/embed.

Fix:
- Ensure `GamePage` passes `slug={game.slug}` to `GamePlayer`.

### `404 Game "<slug>" not found`

Cause:
- Slug exists in app metadata but not in `games` table.

Fix:
- Rerun `npm run seed-games` and confirm slug in DB.

### Save requests not reflected in DB

Cause:
- Game is not posting Protocol A message types expected by the portal bridge.

Fix:
- Ensure game uses:
  - `PORTAL_GAME_DATA_LOAD_REQUEST`
  - `PORTAL_GAME_DATA_SAVE`
  - handles `PORTAL_GAME_DATA_LOADED`

### `401 Not authenticated`

Cause:
- Missing/expired auth context when iframe bridge calls API.

Fix:
- Ensure user is logged in and requests include valid session/bearer token.

### `42501 row-level security policy violation`

Cause:
- RLS blocks required read/write.

Fix:
- Update RLS policies or use controlled service-role server path where appropriate.

---

## Security Notes

- Validate iframe origin before trusting messages.
- Do not allow games to write directly to DB credentials.
- Keep all DB writes in portal server routes.
- Treat `payload` as untrusted input and normalize/validate before persistence.

---

## Quick Reference

- Portal bridge component:
  - `src/components/game-page/player/GameEmbed.tsx`
- Game data API route:
  - `src/app/api/game-data/[slug]/route.ts`
- Game metadata source:
  - `src/data/games.ts`
- Example game-side bridge:
  - `games/human-motion/src/lib/portalBridge.ts`
- Example game-side hook:
  - `games/human-motion/src/lib/usePortalGameData.ts`

## Recommended Convention for New Games

For all new submodule games, use Protocol A (`PORTAL_*`) with a shared TypeScript bridge and a React/Preact hook.

---

## Protocol A Starter (TypeScript + React Hook)

If you want the lowest-friction integration, use this pattern.

### 1) `portalBridge.ts`

Create `src/lib/portalBridge.ts`:

```ts
type JsonRecord = Record<string, unknown>;

type PortalLoadListener = (payload: JsonRecord) => void;

let portalOrigin: string | null = null;
const loadListeners = new Set<PortalLoadListener>();

function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function postToPortal(type: string, payload: JsonRecord = {}): void {
  if (!isInsideIframe()) return;
  window.parent.postMessage({ type, payload }, portalOrigin || "*");
}

function normalizePayload(payload: unknown): JsonRecord {
  return payload && typeof payload === "object" ? (payload as JsonRecord) : {};
}

function handleMessage(event: MessageEvent): void {
  const data = event.data as { type?: string; payload?: unknown } | null;
  if (!data || typeof data !== "object") return;

  if (!portalOrigin) portalOrigin = event.origin;

  if (data.type === "PORTAL_GAME_DATA_LOADED") {
    const normalized = normalizePayload(data.payload);
    loadListeners.forEach((listener) => listener(normalized));
  }
}

export function initPortalBridge(): () => void {
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}

export function fetchGameData(timeoutMs = 5000): Promise<JsonRecord> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      loadListeners.delete(onLoaded);
      reject(new Error("Timed out waiting for PORTAL_GAME_DATA_LOADED"));
    }, timeoutMs);

    const onLoaded: PortalLoadListener = (payload) => {
      window.clearTimeout(timer);
      loadListeners.delete(onLoaded);
      resolve(payload);
    };

    loadListeners.add(onLoaded);
    postToPortal("PORTAL_GAME_DATA_LOAD_REQUEST");
  });
}

export function saveGameData(data: JsonRecord): void {
  postToPortal("PORTAL_GAME_DATA_SAVE", data);
}

export function emitGameEvent(eventName: string, detail: JsonRecord = {}): void {
  postToPortal("PORTAL_GAME_EVENT", { event: eventName, ...detail });
}
```

### 2) `usePortalGameData.ts`

Create `src/lib/usePortalGameData.ts`:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGameData, initPortalBridge, saveGameData } from "./portalBridge";

type JsonRecord = Record<string, unknown>;

export function usePortalGameData() {
  const [data, setData] = useState<JsonRecord>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initPortalBridge();
    let cancelled = false;

    (async () => {
      try {
        const loaded = await fetchGameData();
        if (!cancelled) {
          setData(loaded);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load game data");
          setData({});
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const persist = useCallback((nextData: JsonRecord) => {
    setData(nextData);
    saveGameData(nextData);
  }, []);

  const mergeAndPersist = useCallback((patch: JsonRecord) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      saveGameData(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ data, isLoading, error, persist, mergeAndPersist }),
    [data, isLoading, error, persist, mergeAndPersist],
  );
}
```

### 3) Usage in a game component

```tsx
import { usePortalGameData } from "./lib/usePortalGameData";

export function GameScreen() {
  const { data, isLoading, mergeAndPersist } = usePortalGameData();

  if (isLoading) return <div>Loading...</div>;

  const questionsAsked = Number(data.questions_asked ?? 0);

  function onAnswer() {
    mergeAndPersist({ questions_asked: questionsAsked + 1 });
  }

  return <button onClick={onAnswer}>Answer question</button>;
}
```

This gives each game a 3-line integration: read `data`, call `mergeAndPersist`, and ignore portal/database details.

