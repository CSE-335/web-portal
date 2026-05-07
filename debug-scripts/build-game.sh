#!/bin/bash
# Quick script to build a specific branch of a game and copy it into the portal.
# Usage: ./build-game.sh

# ---- Configure these ----
REPO_DIR=".game-sources/Bridge-Snap"
BRANCH="portal-fix"
GAME_ID="bridge-snap"
# -------------------------

set -e

STATIC_DIR="public/staticGames/$GAME_ID"

echo "==> Fetching branch '$BRANCH' in $REPO_DIR..."
cd "$REPO_DIR"
git fetch origin "$BRANCH"
git checkout FETCH_HEAD

echo "==> Installing dependencies..."
npm ci

echo "==> Building..."
npm run build

echo "==> Copying dist/ -> $STATIC_DIR..."
cd - > /dev/null
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -r "$REPO_DIR/dist/"* "$STATIC_DIR/"

echo "==> Done! $GAME_ID is now built from $BRANCH."
