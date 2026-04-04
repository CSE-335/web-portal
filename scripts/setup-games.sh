#!/bin/bash
# Build all game submodules and stage their output for the portal.
#
# This script:
#   1. Ensures submodules are checked out
#   2. Builds each game in games/
#   3. Copies built files to public/staticGames/<game-id>/
#   4. Copies thumbnails to public/images/<game-id>-thumb.png
#   5. Generates src/data/games.ts from each game's data/game.json
#
# Run this after cloning, after updating submodules, or whenever a game changes.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GAMES_DIR="$ROOT_DIR/games"
PUBLIC_GAMES_DIR="$ROOT_DIR/public/staticGames"
PUBLIC_THUMBS_DIR="$ROOT_DIR/public/gameThumbnails"

# Ensure submodules are checked out
echo "Updating submodules..."
cd "$ROOT_DIR"
git submodule update --init --recursive

# Clean previous game builds and thumbnails from public
rm -rf "$PUBLIC_GAMES_DIR"
rm -rf "$PUBLIC_THUMBS_DIR"
mkdir -p "$PUBLIC_GAMES_DIR"
mkdir -p "$PUBLIC_THUMBS_DIR"

for dir in "$GAMES_DIR"/*/; do
  [ -d "$dir" ] || continue
  game=$(basename "$dir")

  # Build the game if it has a package.json
  if [ -f "$dir/package.json" ]; then
    echo "Building $game..."
    (cd "$dir" && npm ci && npm run build)

    # Read game-id from game.json, fall back to folder name
    game_id="$game"
    if [ -f "$dir/data/game.json" ]; then
      json_id=$(node -e "const g = require('$dir/data/game.json'); console.log(g['game-id'] || '')")
      [ -n "$json_id" ] && game_id="$json_id"
    fi

    # Copy dist output
    if [ -d "$dir/dist" ]; then
      echo "Staging $game -> public/staticGames/$game_id/"
      mkdir -p "$PUBLIC_GAMES_DIR/$game_id"
      cp -r "$dir/dist/"* "$PUBLIC_GAMES_DIR/$game_id/"
    else
      echo "Warning: $game built but no dist/ folder found, skipping."
    fi

    # Copy thumbnail if present
    if [ -f "$dir/data/thumbnail.png" ]; then
      cp "$dir/data/thumbnail.png" "$PUBLIC_THUMBS_DIR/${game_id}.png"
      echo "Copied thumbnail for $game_id"
    fi
  fi
done

# Generate games.ts
echo "Generating src/data/games.ts..."
node "$SCRIPT_DIR/generate-games.js"

echo "Done — all games built and staged."
