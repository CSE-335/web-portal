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
 *   --force          Skip cache and rebuild all games
 *   --metadata-only  Sync repos and generate games.ts without building
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirp } from './osHelper.mjs';
import { buildAndCopy, canSkipGame } from './setupGamesHelper.mjs';
import { getGitCommit, loadCache, readJson, saveCache } from './utils.mjs';
import {
  ROOT_DIR,
  CACHE_GAMES_DIR,
  getConfiguredGameRepos,
  getRepoDirName,
  getRepoCacheDir,
  syncGameRepo,
} from './gameSources.mjs';
import { generateGamesData } from './generate-games.mjs';

const DEFAULT_PUBLIC_GAMES_DIR = path.join(ROOT_DIR, 'public', 'staticGames');
const DEFAULT_PUBLIC_THUMBS_DIR = path.join(ROOT_DIR, 'public', 'gameThumbnails');
const DEFAULT_CACHE_FILE = path.join(ROOT_DIR, '.game-build-cache.json');

export function runSetupGames({
  repoUrls = null,
  publicGamesDir = DEFAULT_PUBLIC_GAMES_DIR,
  publicThumbsDir = DEFAULT_PUBLIC_THUMBS_DIR,
  cacheFile = DEFAULT_CACHE_FILE,
  gameCacheDir = CACHE_GAMES_DIR,
  forceRebuild = false,
  metadataOnly = false,
  onGenerateData = () => generateGamesData(),
} = {}) {
  const urls = repoUrls ?? getConfiguredGameRepos();
  const entries = urls.map((repoUrl) => ({
    repoUrl,
    repoName: getRepoDirName(repoUrl),
  }));

  const cache = forceRebuild ? {} : loadCache(cacheFile);
  const newCache = {};

  let gamesBuilt = 0;
  let gamesSkipped = 0;
  let gamesFailed = 0;

  // Sync all repos first
  for (const { repoUrl, repoName } of entries) {
    const repoDir = getRepoCacheDir(repoUrl, gameCacheDir);

    try {
      syncGameRepo(repoUrl, { cacheDir: gameCacheDir });
    } catch (err) {
      if (!fs.existsSync(repoDir)) {
        console.warn(`Failed to sync ${repoName}; no cached repo available. err: ${err}`);
        gamesFailed++;
        continue;
      }

      console.warn(`Failed to sync ${repoName}, using cached repo. err: ${err}`);
    }
  }

  // In metadata-only mode, just generate games.ts and exit
  if (metadataOnly) {
    console.log('\nGenerating src/data/games.ts (metadata-only mode)...');
    onGenerateData();
    console.log('Done.');
    return { gamesBuilt, gamesSkipped, gamesFailed };
  }

  // Build each game
  mkdirp(publicGamesDir);
  mkdirp(publicThumbsDir);

  for (const { repoUrl, repoName } of entries) {
    const repoDir = getRepoCacheDir(repoUrl, gameCacheDir);

    if (!fs.existsSync(repoDir)) {
      continue; // already warned during sync
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

    const outputDir = path.join(publicGamesDir, gameId);
    const cached = cache[gameId];

    if (canSkipGame(forceRebuild, commit, cached, outputDir)) {
      console.log(`\nSkipping ${repoName} (unchanged at ${commit.slice(0, 8)})`);
      newCache[gameId] = commit;
      gamesSkipped++;
      continue;
    }

    try {
      buildAndCopy(repoName, repoDir, gameId, outputDir, publicThumbsDir);
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

  saveCache(cacheFile, newCache);

  console.log('\nGenerating src/data/games.ts...');
  onGenerateData();

  console.log(`\nDone — ${gamesBuilt} built, ${gamesSkipped} skipped (cached), ${gamesFailed} failed.`);

  return { gamesBuilt, gamesSkipped, gamesFailed };
}

// Run as a script when invoked directly
const _scriptFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === _scriptFile) {
  const result = runSetupGames({
    forceRebuild: process.argv.includes('--force'),
    metadataOnly: process.argv.includes('--metadata-only'),
  });

  if (result.gamesFailed > 0) {
    process.exit(1);
  }
}
