import fs from 'fs';
import path from 'path';
import { run, rmrf, copyDir } from './osHelper.mjs';

export function canSkipGame(forceRebuild, commit, cached, outputDir) {
  return !forceRebuild && commit && cached === commit && fs.existsSync(outputDir);
}

export function buildAndCopy(label, gameDir, gameId, outputDir, thumbsDir) {
  console.log(`\nBuilding ${label}...`);
  run('npm ci', gameDir);
  run('npm run build', gameDir);

  // Copy dist output
  const distDir = path.join(gameDir, 'dist');
  if (fs.existsSync(distDir)) {
    rmrf(outputDir);
    console.log(`Staging ${label} -> public/staticGames/${gameId}/`);
    copyDir(distDir, outputDir);
  } else {
    console.warn(`Warning: ${label} built but no dist/ folder found, skipping.`);
  }

  // Copy thumbnail if present
  const thumbPath = path.join(gameDir, 'data', 'thumbnail.png');
  if (fs.existsSync(thumbPath)) {
    fs.copyFileSync(thumbPath, path.join(thumbsDir, `${gameId}.png`));
    console.log(`Copied thumbnail for ${gameId}`);
  }
}
