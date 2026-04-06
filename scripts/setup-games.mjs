/**
 * Build all game submodules and stage their output for the portal.
 *
 * This script:
 *   1. Fetches and checks out the latest main branch for each game submodule
 *   2. Builds each game in games/ (skips if unchanged since last build)
 *   3. Copies built files to public/staticGames/<game-id>/
 *   4. Copies thumbnails to public/gameThumbnails/<game-id>.png
 *   5. Generates src/data/games.ts from each game's data/game.json
 *
 * Run this after cloning, after updating submodules, or whenever a game changes.
 * Usage: node scripts/setup-games.mjs
 *
 * Flags:
 *   --force    Skip cache and rebuild all games
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run, mkdirp } from './osHelper.mjs';
import { getSubmoduleCommit, loadCache, saveCache } from './utils.mjs';
import { buildAndCopy, canSkipGame } from './setupGamesHelper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');
const PUBLIC_GAMES_DIR = path.join(ROOT_DIR, 'public', 'staticGames');
const PUBLIC_THUMBS_DIR = path.join(ROOT_DIR, 'public', 'gameThumbnails');
const CACHE_FILE = path.join(ROOT_DIR, '.game-build-cache.json');

const forceRebuild = process.argv.includes('--force');

// verify the games directory exists
if (!fs.existsSync(GAMES_DIR)) {
  console.log('No games directory found, nothing to build.');
  process.exit(0);
}

// initialize the submodules
console.log('Initialising submodules...');
run('git submodule init', ROOT_DIR);

// check out the main branch of every submodule
for (const entry of fs.readdirSync(GAMES_DIR, { withFileTypes: true })) {
  // skip if the current entry is not a folder
  if (!entry.isDirectory()) {
    continue;
  }

  const gameDir = path.join(GAMES_DIR, entry.name);

  // skip if there is no package.json within the folder
  if (!fs.existsSync(path.join(gameDir, 'package.json'))) {
    continue;
  }

  // check the submodule out to the latest main branch
  try {
    console.log(`Fetching latest main for ${entry.name}...`);
    run('git fetch origin', gameDir);
    run('git checkout origin/main', gameDir);
  } catch (err) {
    console.warn(`Failed to update ${entry.name}, keeping cached version; err: ${err}`);
  }
}

// 2. Ensure output directories exist
mkdirp(PUBLIC_GAMES_DIR);
mkdirp(PUBLIC_THUMBS_DIR);

const cache = forceRebuild ? {} : loadCache(CACHE_FILE);
const newCache = {};
let gamesBuilt = 0;
let gamesSkipped = 0;
let gamesFailed = 0;

// build each game
for (const dir of fs.readdirSync(GAMES_DIR)) {
  const gameDir = path.join(GAMES_DIR, dir);
  if (!fs.statSync(gameDir).isDirectory()) continue;

  const packagePath = path.join(gameDir, 'package.json');
  if (!fs.existsSync(packagePath)) continue;

  // skip if the submodule has no valid commit
  const commit = getSubmoduleCommit(gameDir);
  if (!commit) {
    console.warn(`Skipping ${dir} — no valid git commit found`);
    continue;
  }

  // Read game-id from game.json, fall back to folder name
  let gameId = dir;
  const metaPath = path.join(gameDir, 'data', 'game.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    if (meta['game-id']) gameId = meta['game-id'];
  }

  // Check if we can skip this game
  const outputDir = path.join(PUBLIC_GAMES_DIR, gameId);
  const cached = cache[gameId];

  if (canSkipGame(forceRebuild, commit, cached, outputDir)) {
    console.log(`\nSkipping ${dir} (unchanged at ${commit.slice(0, 8)})`);
    newCache[gameId] = commit;
    gamesSkipped++;
    continue;
  }

  // get the game's dependencies and build it
  try {
    buildAndCopy(dir, gameDir, gameId, outputDir, PUBLIC_THUMBS_DIR);

    newCache[gameId] = commit;
    gamesBuilt++;
  } catch (err) {
    console.warn(`Failed to build ${dir}, keeping cached version. err: ${err}`);

    // preserve the old cache hash
    if (cache[gameId]) {
      newCache[gameId] = cache[gameId];
    }

    gamesFailed++;
  }
}

saveCache(CACHE_FILE, newCache);

// 4. Generate games.ts
console.log('\nGenerating src/data/games.ts...');
await import('./generate-games.mjs');

console.log(`\nDone — ${gamesBuilt} built, ${gamesSkipped} skipped (cached), ${gamesFailed} failed.`);
