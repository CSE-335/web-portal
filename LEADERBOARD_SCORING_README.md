# Leaderboard Scoring Integration (Quick Guide)

Use this checklist to make sure your game's score data shows up correctly in the profile leaderboard.

## TL;DR

- Save your best score in your `game_data.data_json`.
- Include **at least one numeric field** named `highScore` (preferred) or `score`.
- The leaderboard reads the **highest value** per user for each game.
- Leaderboards are now **per-game only** (must query with a game `slug`).

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

- `circuit-breaker`: `circuitBreaker.highScore`, `circuitBreaker.score`
- `sonic-lab`: `points`, `sonicLab.highScore`, `sonicLab.points`
- `matrix-meadow`: `matrixMeadow.highScore`, `matrixMeadow.score`

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
4. Optional API check:

```bash
GET /api/leaderboards?slug=<your-game-slug>&scope=global
```

Expected success response includes:

- `"ok": true`
- `"mode": "per-game"`
- `"slug": "<your-game-slug>"`
- ranked `entries` with `bestScore`

## Common Failure Cases

- Missing `slug` in leaderboard request.
- Score stored under an unsupported key/path.
- Score stored as non-numeric text.
- Game data never persisted for the authenticated user.

