/**
 * Generates src/data/games.ts from game.json files in game submodules.
 *
 * Each game submodule should have a data/game.json with metadata.
 * This script reads all of them and produces a typed TypeScript array
 * that the portal imports.
 *
 * Run via: node scripts/generate-games.mjs
 * Or via:  node scripts/setup-games.mjs (which calls this automatically)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gamesDir = path.join(__dirname, '..', 'games');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'games.ts');
const games = [];
const validSubjects = ['Science', 'Technology', 'Engineering', 'Mathematics'];

if (fs.existsSync(gamesDir)) {
  for (const dir of fs.readdirSync(gamesDir)) {
    const gameDir = path.join(gamesDir, dir);
    if (!fs.statSync(gameDir).isDirectory()) continue;

    // Look for data/game.json
    const metaPath = path.join(gameDir, 'data', 'game.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`Skipping ${dir} — no data/game.json found`);
      continue;
    }

    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch (err) {
      console.warn(`Skipping ${dir} — failed to parse game.json: ${err}`);
      continue;
    }

    const gameId = meta['game-id'];
    if (!gameId) {
      console.warn(`Skipping ${dir} — game.json missing "game-id" field`);
      continue;
    }

    const subject = meta.subject ?? 'Technology';
    if (!validSubjects.includes(subject)) {
      console.warn(`Skipping ${dir} — invalid subject "${subject}", must be one of: ${validSubjects.join(', ')}`);
      continue;
    }

    const iframeSrc = `/staticGames/${gameId}/index.html`;

    games.push({
      slug: gameId,
      title: meta.title ?? gameId,
      subject,
      description: meta.description ?? '',
      longDescription: meta.longDescription ?? [],
      iframeSrc,
      thumbnailSrc: `/gameThumbnails/${gameId}.png`,
      embedHeight: meta.embedHeight ?? '800px',
      featured: meta.featured ?? false,
      tags: meta.tags ?? [],
    });

    console.log(`Added ${gameId}`);
  }
}

const output = `// Auto-generated from game submodules — do not edit manually.
// Run node scripts/setup-games.mjs or node scripts/generate-games.mjs to regenerate.

export type GameMeta = {
  slug: string;
  title: string;
  subject: "Science" | "Technology" | "Engineering" | "Mathematics";
  description: string;
  longDescription: string[];
  iframeSrc: string;
  thumbnailSrc: string;
  embedHeight?: string;
  featured?: boolean;
  tags?: string[];
};

export const games: GameMeta[] = ${JSON.stringify(games, null, 2)};

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath} with ${games.length} game(s).`);
