import { execSync } from 'child_process';
import fs from 'fs';

export function getSubmoduleCommit(gameDir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: gameDir, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function loadCache(cacheFile) {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveCache(cacheFile, cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
