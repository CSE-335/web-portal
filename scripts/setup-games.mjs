/**
 * Sync game repos from the manifest, build them, and stage their output.
 *
 * This script:
 *   1. Clones or syncs each configured game repo into .game-sources/
 *   2. Builds each game (skips if unchanged since last build)
 *   3. Copies built files to public/staticGames/<game-id>/
 *   4. Copies thumbnails to public/gameThumbnails/<game-id>.png
 *   5. Generates src/data/games.ts from each repo's data/game.json
 *
 * Run this after cloning, whenever games.config.mjs changes, or whenever a
 * game repo changes upstream.
 *
 * Usage: node scripts/setup-games.mjs
 *
 * Flags:
 *   --force    Skip cache and rebuild all games
 */

import fs from 'fs';
import path from 'path';
import { mkdirp } from './osHelper.mjs';
import { buildAndCopy, canSkipGame } from './setupGamesHelper.mjs';
import { getGitCommit, loadCache, readJson, saveCache } from './utils.mjs';
import {
  ROOT_DIR,
  getConfiguredGameEntries,
  getRepoCacheDir,
  syncGameRepo,
} from './gameSources.mjs';
import { generateGamesData } from './generate-games.mjs';

const PUBLIC_GAMES_DIR = path.join(ROOT_DIR, 'public', 'staticGames');
const PUBLIC_THUMBS_DIR = path.join(ROOT_DIR, 'public', 'gameThumbnails');
const CACHE_FILE = path.join(ROOT_DIR, '.game-build-cache.json');

const forceRebuild = process.argv.includes('--force');
const cache = forceRebuild ? {} : loadCache(CACHE_FILE);
const newCache = {};

let gamesBuilt = 0;
let gamesSkipped = 0;
let gamesFailed = 0;

mkdirp(PUBLIC_GAMES_DIR);
mkdirp(PUBLIC_THUMBS_DIR);

for (const { repoUrl, repoName } of getConfiguredGameEntries()) {
  const repoDir = getRepoCacheDir(repoUrl);

  try {
    syncGameRepo(repoUrl);
  } catch (err) {
    if (!fs.existsSync(repoDir)) {
      console.warn(`Failed to sync ${repoName}; no cached repo available. err: ${err}`);
      gamesFailed++;
      continue;
    }

    console.warn(`Failed to sync ${repoName}, using cached repo. err: ${err}`);
  }

  const commit = getGitCommit(repoDir);
  if (!commit) {
    console.warn(`Skipping ${repoName} — no valid git commit found`);
    gamesFailed++;
    continue;
  }

  const metaPath = path.join(repoDir, 'data', 'game.json');
  if (!fs.existsSync(metaPath)) {
    console.warn(`Skipping ${repoName} — no data/game.json found`);
    gamesFailed++;
    continue;
  }

  let gameId = repoName;
  try {
    const meta = readJson(metaPath);
    if (meta['game-id']) {
      gameId = meta['game-id'];
    }
  } catch (err) {
    console.warn(`Skipping ${repoName} — failed to parse data/game.json: ${err}`);
    gamesFailed++;
    continue;
  }

  const outputDir = path.join(PUBLIC_GAMES_DIR, gameId);
  const cached = cache[gameId];

  if (canSkipGame(forceRebuild, commit, cached, outputDir)) {
    console.log(`\nSkipping ${repoName} (unchanged at ${commit.slice(0, 8)})`);
    newCache[gameId] = commit;
    gamesSkipped++;
    continue;
  }

  try {
    buildAndCopy(repoName, repoDir, gameId, outputDir, PUBLIC_THUMBS_DIR);
    newCache[gameId] = commit;
    gamesBuilt++;
  } catch (err) {
    console.warn(`Failed to build ${repoName}, keeping cached version. err: ${err}`);

    if (cache[gameId]) {
      newCache[gameId] = cache[gameId];
    }

    gamesFailed++;
  }
}

saveCache(CACHE_FILE, newCache);

console.log('\nGenerating src/data/games.ts...');
generateGamesData();

console.log(`\nDone — ${gamesBuilt} built, ${gamesSkipped} skipped (cached), ${gamesFailed} failed.`);
