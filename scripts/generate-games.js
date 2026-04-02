/**
 * Generates src/data/games.ts from game.json files in game submodules.
 *
 * Each game submodule should have a data/game.json with metadata.
 * This script reads all of them and produces a typed TypeScript array
 * that the portal imports.
 *
 * Run via: node scripts/generate-games.js
 * Or via:  ./scripts/setup-games.sh (which calls this automatically)
 */

const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '..', 'games');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'games.ts');
const games = [];

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

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    const gameId = meta['game-id'];
    if (!gameId) {
      console.warn(`Skipping ${dir} — game.json missing "game-id" field`);
      continue;
    }

    const iframeSrc = `/staticGames/${gameId}/index.html`;

    games.push({
      slug: gameId,
      title: meta.title ?? gameId,
      subject: meta.subject ?? 'Technology',
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
// Run ./scripts/setup-games.sh or node scripts/generate-games.js to regenerate.

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

fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath} with ${games.length} game(s).`);
