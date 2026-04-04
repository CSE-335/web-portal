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

The bridge supports **two protocols** for backward compatibility.

### Protocol A: Legacy `PORTAL_*`

Game -> Portal:

- `PORTAL_GAME_DATA_LOAD_REQUEST`
- `PORTAL_GAME_DATA_SAVE` with `payload` as JSON data

Portal -> Game:

- `PORTAL_GAME_DATA_LOADED` with `payload` as JSON data

### Protocol B: Generic request/response (`source: "<game-source>"`)

Use a unique source string per game. The source does not need to be globally standardized, but it should be stable for that game.

Game -> Portal:

- `{ source: "<game-source>", type: "getGameData", requestId, payload }`
- `{ source: "<game-source>", type: "saveGameData", requestId, payload: { data } }`
- `{ source: "<game-source>", type: "gameEvent", payload }` (optional analytics/event)

Portal -> Game:

- Success:
  - `{ source: "<game-source>", requestId, payload: <gameData or { ok: true }> }`
- Error:
  - `{ source: "<game-source>", requestId, error: "..." }`

`requestId` is required for promise-style request/response handling.

If your game does not need a custom source/request-response pattern, use Protocol A (`PORTAL_*`) only.

---

## Game-Side Integration (Recommended)

If your game uses a shared bridge helper, expose:

- `fetchGameData()`
- `saveGameData(data)`
- `emitGameEvent(name, detail)`

Example:

```javascript
import { fetchGameData, saveGameData } from "./lib/portalBridge";

const state = await fetchGameData();
const questionsAsked = Number(state?.questions_asked ?? 0) + 1;

await saveGameData({
  ...(state && typeof state === "object" ? state : {}),
  questions_asked: questionsAsked,
});
```

---

## End-to-End Example: Increment a Counter

Goal: every answered question increments `questions_asked`.

Pattern:

1. Load current JSON once:
   - `state = await fetchGameData()`
2. Compute next value:
   - `next = (state.questions_asked ?? 0) + 1`
3. Save merged JSON:
   - `await saveGameData({ ...state, questions_asked: next })`

This ensures data is additive and does not overwrite unrelated fields.

---

## Local Development Checklist

1. Game appears in metadata:
   - `src/data/games.ts` has your game slug.
2. Games table is seeded:
   - Hit `/api/seed`.
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
- Rerun seed endpoint and confirm slug in DB.

### Save requests not reflected in DB

Cause:
- Game posts a custom source/type, but portal bridge does not handle that message.

Fix:
- Ensure game uses one of the supported protocols:
  - `PORTAL_*`, or
  - request/response with `source`, `type: getGameData|saveGameData`, and `requestId`.

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
  - `games/human-motion/src/lib/portalBridge.js`

## Recommended Convention for New Games

For new submodule games, pick one:

1. **Simplest (recommended):** use Protocol A (`PORTAL_*`) and skip custom `source`.
2. **Advanced:** use Protocol B with a unique `source` string for that game.

Both approaches can persist to the same `game_data.data_json` table through the same portal route.

