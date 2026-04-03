/**
 * Build all game submodules and stage their output for the portal.
 *
 * This script:
 *   1. Ensures submodules are checked out
 *   2. Builds each game in games/ (skips if unchanged since last build)
 *   3. Copies built files to public/staticGames/<game-id>/
 *   4. Copies thumbnails to public/gameThumbnails/<game-id>.png
 *   5. Generates src/data/games.ts from each game's data/game.json
 *
 * Run this after cloning, after updating submodules, or whenever a game changes.
 * Usage: node scripts/setup-games.js
 *
 * Flags:
 *   --force    Skip cache and rebuild all games
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');
const PUBLIC_GAMES_DIR = path.join(ROOT_DIR, 'public', 'staticGames');
const PUBLIC_THUMBS_DIR = path.join(ROOT_DIR, 'public', 'gameThumbnails');
const CACHE_FILE = path.join(ROOT_DIR, '.game-build-cache.json');

const forceRebuild = process.argv.includes('--force');

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: cwd || ROOT_DIR, stdio: 'inherit' });
}

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getSubmoduleCommit(gameDir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: gameDir, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// 1. Ensure submodules are checked out
console.log('Updating submodules...');
run('git submodule update --init --recursive');

// 2. Ensure output directories exist
mkdirp(PUBLIC_GAMES_DIR);
mkdirp(PUBLIC_THUMBS_DIR);

const cache = forceRebuild ? {} : loadCache();
const newCache = {};
let gamesBuilt = 0;
let gamesSkipped = 0;

// 3. Build each game
if (fs.existsSync(GAMES_DIR)) {
  for (const dir of fs.readdirSync(GAMES_DIR)) {
    const gameDir = path.join(GAMES_DIR, dir);
    if (!fs.statSync(gameDir).isDirectory()) continue;

    const packagePath = path.join(gameDir, 'package.json');
    if (!fs.existsSync(packagePath)) continue;

    // Read game-id from game.json, fall back to folder name
    let gameId = dir;
    const metaPath = path.join(gameDir, 'data', 'game.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (meta['game-id']) gameId = meta['game-id'];
    }

    // Check if we can skip this game
    const commit = getSubmoduleCommit(gameDir);
    const outputDir = path.join(PUBLIC_GAMES_DIR, gameId);
    const cached = cache[gameId];

    if (!forceRebuild && commit && cached === commit && fs.existsSync(outputDir)) {
      console.log(`\nSkipping ${dir} (unchanged at ${commit.slice(0, 8)})`);
      newCache[gameId] = commit;
      gamesSkipped++;
      continue;
    }

    // Build
    console.log(`\nBuilding ${dir}...`);
    run('npm ci', gameDir);
    run('npm run build', gameDir);

    // Copy dist output
    const distDir = path.join(gameDir, 'dist');
    if (fs.existsSync(distDir)) {
      rmrf(outputDir);
      console.log(`Staging ${dir} -> public/staticGames/${gameId}/`);
      copyDir(distDir, outputDir);
    } else {
      console.warn(`Warning: ${dir} built but no dist/ folder found, skipping.`);
    }

    // Copy thumbnail if present
    const thumbPath = path.join(gameDir, 'data', 'thumbnail.png');
    if (fs.existsSync(thumbPath)) {
      fs.copyFileSync(thumbPath, path.join(PUBLIC_THUMBS_DIR, `${gameId}.png`));
      console.log(`Copied thumbnail for ${gameId}`);
    }

    if (commit) newCache[gameId] = commit;
    gamesBuilt++;
  }
}

saveCache(newCache);

// 4. Generate games.ts
console.log('\nGenerating src/data/games.ts...');
require('./generate-games.js');

console.log(`\nDone — ${gamesBuilt} built, ${gamesSkipped} skipped (cached).`);
