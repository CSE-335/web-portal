# How to Add New Games in the Portal

This portal syncs game repositories from a manifest, builds them locally, and bakes the built output into `public/staticGames/`.

## Overview
The portal expects every game repo to follow the same structure:

```text
data/
  game.json
  thumbnail.png
dist/
package.json
```

Every game repo must support:
- `npm ci`
- `npm run build`
- build output in `dist/`
- metadata in `data/game.json`
- thumbnail in `data/thumbnail.png`

The portal uses `data/game.json` as the source of truth for the game id and display metadata.

## Step 1: Add The Repo URL To The Manifest
Open `games.config.mjs` and add the repo URL to the `gameRepos` array.

Example:

```js
export const gameRepos = [
  'https://github.com/etchre/python-programming-game.git',
  'https://github.com/example/new-game.git',
];
```

## Step 2: Verify The Game Repo Structure
Each game repo must include:

### `data/game.json`

Required fields:
- `game-id`

Common optional fields:
- `title`
- `subject`
- `description`
- `longDescription`
- `embedHeight`
- `featured`
- `tags`

Example:

```json
{
  "game-id": "matrix-meadow",
  "title": "Matrix Meadow Academy",
  "subject": "Mathematics",
  "description": "Practice matrix multiplication through interactive challenges.",
  "longDescription": [
    "Long-form description paragraph 1.",
    "Long-form description paragraph 2."
  ],
  "embedHeight": "800px",
  "featured": true,
  "tags": ["math", "matrices"]
}
```

### `data/thumbnail.png`
- Recommended size: 1280 x 720
- Format: PNG preferred

### Vite Base Path
The built game must serve correctly from:

```text
/staticGames/<game-id>/
```

For Vite games, the `base` setting should be derived from `data/game.json`.

## Step 3: Sync And Build The Games
Run:

```bash
npm run setup-games
```

This script will:
1. Clone or update every repo from `games.config.mjs` into `.game-sources/`
2. Build each game
3. Copy built files into `public/staticGames/<game-id>/`
4. Copy thumbnails into `public/gameThumbnails/<game-id>.png`
5. Regenerate `src/data/games.ts`

## Step 4: Test In The Portal
After running `npm run setup-games`, the game will be available at:

```text
/games/<game-id>
```

**Mobile & iframe sizing (for game repos):** use the copy-paste pack in [`MOBILE_EMBED_GAME_GUIDE.md`](./MOBILE_EMBED_GAME_GUIDE.md) (viewport, CSS, resize script, `embedHeight` notes, and a per-game README checklist). Portal height rules live in `src/lib/games/embed-height.ts`.

Checklist:
- Repo URL added to `games.config.mjs`
- `data/game.json` includes a valid `game-id`
- `data/thumbnail.png` exists
- `npm run build` produces `dist/`
- Game loads correctly at `/games/<game-id>`
- Built assets use `/staticGames/<game-id>/` as their base path

## Common Issues
- Blank iframe: the built app may be using the wrong asset base path
- Missing game in the portal: `data/game.json` may be missing or invalid
- Missing thumbnail: `data/thumbnail.png` may be absent
- Old game version still showing: rerun `npm run setup-games` to resync the cached repo
