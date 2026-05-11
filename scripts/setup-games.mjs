/**
 * Sync game repos from the manifest, build them, and stage their output.
 *
 * This script:
 *   1. Clones or syncs each configured game repo into .game-sources/
 *   2. Builds each game (skips if unchanged since last build)
 *   3. Copies built files to public/staticGames/<game-id>/
 *   4. Copies thumbnails to public/gameThumbnails/<game-id>.png
 *   5. Generates src/data/games.ts from each repo's data/game.json
 *   6. Seeds game metadata to Supabase via scripts/seed-games.js (when credentials exist)
 *
 * Run this after cloning, whenever games.config.mjs changes, or whenever a
 * game repo changes upstream.
 *
 * Usage: node scripts/setup-games.mjs
 *
 * Flags:
 *   --force          Skip cache, rebuild all games, and force-reset seeded DB rows
 *   --metadata-only  Sync repos and generate games.ts without building
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { mkdirp } from './osHelper.mjs';
import { buildAndCopy, canSkipGame } from './setupGamesHelper.mjs';
import { getGitCommit, loadCache, readJson, saveCache } from './utils.mjs';
import {
  ROOT_DIR,
  CACHE_GAMES_DIR,
  getConfiguredGameRepos,
  getRepoDirName,
  syncGameRepo,
} from './gameSources.mjs';
import { generateGamesData } from './generate-games.mjs';

const PUBLIC_GAMES_DIR = path.join(ROOT_DIR, 'public', 'staticGames');
const PUBLIC_THUMBS_DIR = path.join(ROOT_DIR, 'public', 'gameThumbnails');
const CACHE_FILE = path.join(ROOT_DIR, '.game-build-cache.json');

function runSeedGames(forceRebuild) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      '\nSkipping games metadata seed — NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set ' +
        '(expected for fork PR CI / local runs without secrets).',
    );
    return;
  }

  const seedScript = path.join(ROOT_DIR, 'scripts', 'seed-games.js');
  if (!fs.existsSync(seedScript)) {
    console.warn(`\nSkipping games metadata seed — missing ${seedScript}`);
    return;
  }

  const seedArgs = [seedScript];
  if (forceRebuild) {
    seedArgs.push('--force');
  }

  console.log(`\nSeeding games metadata${forceRebuild ? ' with --force' : ''}...`);
  const result = spawnSync(process.execPath, seedArgs, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }
}

export function runSetupGames({
  repoUrls,
  publicGamesDir = PUBLIC_GAMES_DIR,
  publicThumbsDir = PUBLIC_THUMBS_DIR,
  cacheFile = CACHE_FILE,
  gameCacheDir = CACHE_GAMES_DIR,
  forceRebuild = false,
  metadataOnly = false,
  onGenerateData = generateGamesData,
} = {}) {
  const urls = repoUrls ?? getConfiguredGameRepos();
  const cache = forceRebuild ? {} : loadCache(cacheFile);
  const newCache = {};
  let gamesBuilt = 0;
  let gamesSkipped = 0;
  let gamesFailed = 0;

  // Sync repos
  const entries = urls.map((repoUrl) => {
    const repoName = getRepoDirName(repoUrl);
    const repoDir = syncGameRepo(repoUrl, { cacheDir: gameCacheDir });
    return { repoUrl, repoName, repoDir };
  });

  if (!metadataOnly) {
    // Build each game
    mkdirp(publicGamesDir);
    mkdirp(publicThumbsDir);

    for (const { repoName, repoDir } of entries) {
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
  }

  console.log('\nGenerating src/data/games.ts...');
  onGenerateData();

  if (!metadataOnly) {
    runSeedGames(forceRebuild);
  }

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
