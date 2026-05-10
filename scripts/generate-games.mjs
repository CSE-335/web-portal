/**
 * Generates src/data/games.ts from data/game.json files in cached game repos.
 *
 * Each repo listed in games.config.mjs must provide a data/game.json file.
 * Run via: node scripts/generate-games.mjs
 * Or via:  node scripts/setup-games.mjs (which syncs repos first)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT_DIR, getConfiguredGameEntries } from './gameSources.mjs';
import { readJson } from './utils.mjs';

const _scriptFile = fileURLToPath(import.meta.url);
const outputPath = path.join(ROOT_DIR, 'src', 'data', 'games.ts');
const validSubjects = ['Science', 'Technology', 'Engineering', 'Mathematics'];

export function generateGamesData() {
  const games = [];
  const missingRepos = [];

  for (const { repoName, repoDir } of getConfiguredGameEntries()) {
    if (!fs.existsSync(repoDir)) {
      missingRepos.push(repoName);
      continue;
    }

    const metaPath = path.join(repoDir, 'data', 'game.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`Skipping ${repoName} — no data/game.json found`);
      continue;
    }

    let meta;
    try {
      meta = readJson(metaPath);
    } catch (err) {
      console.warn(`Skipping ${repoName} — failed to parse game.json: ${err}`);
      continue;
    }

    const gameId = meta['game-id'];
    if (!gameId) {
      console.warn(`Skipping ${repoName} — game.json missing "game-id" field`);
      continue;
    }

    const subject = meta.subject ?? 'Technology';
    if (!validSubjects.includes(subject)) {
      console.warn(`Skipping ${repoName} — invalid subject "${subject}", must be one of: ${validSubjects.join(', ')}`);
      continue;
    }

    const entry = {
      slug: gameId,
      title: meta.title ?? gameId,
      subject,
      description: meta.description ?? '',
      longDescription: meta.longDescription ?? [],
      iframeSrc: `/staticGames/${gameId}/index.html`,
      thumbnailSrc: `/gameThumbnails/${gameId}.png`,
      embedHeight: meta.embedHeight ?? '800px',
      featured: meta.featured ?? false,
      tags: meta.tags ?? [],
    };

    const assistantTutorBrief = meta['assistant-tutor-brief'];
    if (typeof assistantTutorBrief === 'string' && assistantTutorBrief.trim() !== '') {
      entry.assistantTutorBrief = assistantTutorBrief.trim();
    }
    const assistantTargetConcept = meta['assistant-target-concept'];
    if (
      typeof assistantTargetConcept === 'string' &&
      assistantTargetConcept.trim() !== ''
    ) {
      entry.assistantDefaultTargetConcept = assistantTargetConcept.trim();
    }
    const assistantMistakeGuide = meta['assistant-mistake-guide'];
    if (
      typeof assistantMistakeGuide === 'string' &&
      assistantMistakeGuide.trim() !== ''
    ) {
      entry.assistantMistakeGuide = assistantMistakeGuide.trim();
    }
    const assistantDialogueConstraints = meta['assistant-dialogue-constraints'];
    if (
      typeof assistantDialogueConstraints === 'string' &&
      assistantDialogueConstraints.trim() !== ''
    ) {
      entry.assistantDialogueConstraints = assistantDialogueConstraints.trim();
    }

    games.push(entry);

    console.log(`Added ${gameId}`);
  }

  if (missingRepos.length > 0) {
    throw new Error(
      `Missing cached game repos (${missingRepos.join(', ')}). Run node scripts/setup-games.mjs first.`,
    );
  }

  const output = `// Auto-generated from manifest-managed game repos — do not edit manually.
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
  /** Optional: richer tutor context for the web assistant (see gameIntegration). */
  assistantTutorBrief?: string;
  /** Optional: default learning-topic label for assistant chat session. */
  assistantDefaultTargetConcept?: string;
  /** Optional: common wrong answers / misconceptions so the assistant can address slips concretely. */
  assistantMistakeGuide?: string;
  /** Optional: extra hub tutor rules (tone, topics to avoid). See gameIntegration + assistant API prompts. */
  assistantDialogueConstraints?: string;
};

export const games: GameMeta[] = ${JSON.stringify(games, null, 2)};

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(`Generated ${outputPath} with ${games.length} game(s).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === _scriptFile) {
  generateGamesData();
}
