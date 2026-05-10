# Leaderboard Scoring Integration (Quick Guide)

Use this checklist to make sure your game's score data shows up correctly in the profile leaderboard.

## TL;DR

- Save your best score in your `game_data.data_json`.
- Include **at least one numeric field** named `highScore` (preferred) or `score`.
- The leaderboard reads the **highest value** per user for each game (and optional `?track=` column for games with multiple boards).
- Leaderboards are **per-game only** (must query with a game `slug`). Use `?scope=friends` to restrict to you plus accepted friends.
- Query param `?track=` defaults to `overall`. Unsupported values for that game resolve to `overall` (see `parseLeaderboardTrack` in `src/lib/leaderboardTracks.ts`).

## Required Score Format

Your game's payload in `data_json` must contain a numeric score at one of these paths:

### Preferred (works for all games)

```json
{
  "highScore": 1234
}
```

### Also accepted (global fallback)

```json
{
  "score": 1234
}
```

### Optional game-specific aliases currently supported

- **`circuit-breaker` (portal tracks)**  
  - **Overall** (`track` omitted or `overall`): `highScore`, `score`, `circuitBreaker.highScore`, `circuitBreaker.score`. (If endless and campaign both write the same root fields, pick one meaning for **overall** or split: use **per-level** + **circuit-endless** for clarity.)  
  - **Endless** (`track=circuit-endless`): same “first matching path” rule; order is `endlessBest.score`, `endlessBest.highScore`, `circuitBreaker.endless.highScore`, `circuitBreaker.endless.score`, `circuitBreaker.endlessBest.score`, `circuitBreaker.endlessBest.highScore` (root `highScore` / `score` are **not** used for this track).
  - **Per campaign level** (`track=circuit-level-<n>`, n = 1–5, matching the shipped campaign’s level ids): only the paths below are consulted (root `highScore` / `score` are **not** used for this track). The hub uses the **first** path that yields a finite number, in this order (higher is better — use a speed-derived points field, not raw `elapsedMs`, unless you invert client-side):  
    `circuitBreaker.levels.<n>.highScore` → `.score` → `circuitBreaker.levelScores.<n>` → `campaignBests.<n>.speedScore` → `campaignBests.<n>.highScore` / `.score` / `.diffusalScore` → same keys under `circuitBreaker.campaignBests.<n>.*`.
  - **Guided intro vs real level 1:** If your guided slice shares `id: 1` with Gate Basics, either skip portal sync for guided, use a separate `leaderboardKey` in `scoreMeta`, or store guided under a different key than `"1"` in `campaignBests` so **level 1** on the board is only the real campaign level.  
  - **`scoresVersion`:** Safe to add in JSON for your own migrations; the hub ignores it and only reads the paths above.
- **`sonic-lab`** (`track` omitted or `overall`): first match among `highScore`, `score`, `points`, `sonicLab.highScore`, `sonicLab.points`.
- **`matrix-meadow`**  
  - **Overall** (`track` omitted or `overall`): `highScore`, `score`, `matrixMeadow.highScore`, `matrixMeadow.score`.  
  - **Multiplication drill** (`track=multiplication-drill`): `matrixMeadow.multiplicationDrill.highScore` → `.score` → `matrixMeadow.drill.highScore` → `.score` → `multiplicationDrillHighScore` → `drillHighScore`.  
  - **Vocabulary quiz** (`track=vocabulary-quiz`): `matrixMeadow.vocabularyQuiz.highScore` → `.score` → `matrixMeadow.vocabQuiz.highScore` → `.score` → `vocabularyQuizHighScore` → `vocabQuizHighScore`.  

For each track, the API walks the list in order and uses the **first** path that yields a finite number (higher is better when comparing rows).

If possible, still include `highScore` at the root for consistency across games.

## Copy/Paste Example (Recommended)

Use this shape whenever you send/save game data:

```json
{
  "highScore": 9876,
  "score": 9876,
  "lastPlayedAt": "2026-05-07T20:00:00Z",
  "stats": {
    "levelReached": 12
  }
}
```

## Rules to Avoid Leaderboard Issues

- Score value must be a valid number (or numeric string).
- Do not store score only in a deeply nested custom path unless it is one of the supported aliases above.
- Keep score semantics as "higher is better".
- Ensure data is saved under the correct game record (`game_id` that matches your game slug).

## Quick Verification Steps

1. Play your game and submit/update score data.
2. Open profile leaderboard and select your game.
3. Confirm your user appears with the expected score.
4. Optional API check (authenticated session required):

```bash
GET /api/leaderboards?slug=<your-game-slug>&scope=global
GET /api/leaderboards?slug=<your-game-slug>&scope=friends
GET /api/leaderboards?slug=circuit-breaker&track=circuit-level-3&scope=global
GET /api/leaderboards?slug=circuit-breaker&track=circuit-endless&scope=global
GET /api/leaderboards?slug=matrix-meadow&track=multiplication-drill&scope=global
GET /api/leaderboards?slug=matrix-meadow&track=vocabulary-quiz&scope=global
```

Optional query param: `limit` (integer, default **20**, max **100**) caps how many ranked rows are returned.

Expected success response includes:

- `"ok": true`
- `"scope": "global"` or `"friends"`
- `"mode": "per-game"`
- `"slug": "<your-game-slug>"`
- `"track": "<resolved-track>"` (e.g. `overall`, `circuit-level-3`, `multiplication-drill`)
- ranked `entries` with `userId`, `displayName`, `avatarUrl`, and `bestScore`

## Common Failure Cases

- Missing `slug` in leaderboard request.
- Score stored under an unsupported key/path.
- Score stored as non-numeric text.
- Game data never persisted for the authenticated user.

