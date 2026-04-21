import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gameRepos } from '../games.config.mjs';
import { mkdirp, rmrf, run } from './osHelper.mjs';

const _scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.join(_scriptDir, '..');
export const CACHE_GAMES_DIR = path.join(ROOT_DIR, '.game-sources');
export const DEFAULT_GAME_BRANCH = 'main';

export function getConfiguredGameRepos() {
  if (!Array.isArray(gameRepos)) {
    throw new Error('games.config.mjs must export gameRepos as an array of repo URLs');
  }

  return gameRepos.map((repoUrl) => {
    if (typeof repoUrl !== 'string' || repoUrl.trim() === '') {
      throw new Error('games.config.mjs entries must be non-empty repo URL strings');
    }

    return repoUrl.trim();
  });
}

export function getRepoDirName(repoUrl) {
  const trimmed = repoUrl.replace(/\/+$/, '');
  const repoName = trimmed.split('/').pop()?.replace(/\.git$/, '');

  if (!repoName) {
    throw new Error(`Could not derive a cache directory name from repo URL: ${repoUrl}`);
  }

  return repoName;
}

export function getRepoCacheDir(repoUrl, cacheDir = CACHE_GAMES_DIR) {
  return path.join(cacheDir, getRepoDirName(repoUrl));
}

export function getConfiguredGameEntries(cacheDir = CACHE_GAMES_DIR) {
  return getConfiguredGameRepos().map((repoUrl) => ({
    repoUrl,
    repoName: getRepoDirName(repoUrl),
    repoDir: getRepoCacheDir(repoUrl, cacheDir),
  }));
}

export function ensureGameCacheDir(cacheDir = CACHE_GAMES_DIR) {
  mkdirp(cacheDir);
}

export function getOriginUrl(repoDir) {
  try {
    return execSync('git remote get-url origin', { cwd: repoDir, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function syncGameRepo(repoUrl, { cacheDir = CACHE_GAMES_DIR } = {}) {
  ensureGameCacheDir(cacheDir);

  const repoName = getRepoDirName(repoUrl);
  const repoDir = getRepoCacheDir(repoUrl, cacheDir);

  if (fs.existsSync(repoDir)) {
    const originUrl = getOriginUrl(repoDir);
    if (originUrl !== repoUrl) {
      console.warn(`Replacing cached repo for ${repoName}; origin mismatch (${originUrl ?? 'missing'})`);
      rmrf(repoDir);
    }
  }

  if (!fs.existsSync(repoDir)) {
    console.log(`Cloning ${repoName}...`);
    run(`git clone --branch ${DEFAULT_GAME_BRANCH} --single-branch ${repoUrl} ${repoDir}`, ROOT_DIR, 30000);
  }

  console.log(`Syncing ${repoName}...`);
  run(`git fetch origin ${DEFAULT_GAME_BRANCH} --prune`, repoDir, 30000);
  run(`git checkout --force origin/${DEFAULT_GAME_BRANCH}`, repoDir);
  run('git clean -fd', repoDir);

  return repoDir;
}
