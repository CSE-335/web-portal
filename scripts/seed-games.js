/* eslint-disable @typescript-eslint/no-require-imports -- Node CJS script */
/**
 * Seed game metadata into Supabase.
 *
 * Default mode is non-destructive:
 *   - update existing rows by slug
 *   - insert missing rows
 *
 * Use --force to delete all rows and reinsert.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ROOT_DIR = path.join(__dirname, '..');
const GAMES_TS_PATH = path.join(ROOT_DIR, 'src', 'data', 'games.ts');
const forceReset = process.argv.includes('--force');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx < 0) continue;

    const key = line.slice(0, idx).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function loadGamesFromGeneratedTs() {
  if (!fs.existsSync(GAMES_TS_PATH)) {
    throw new Error(
      'Missing src/data/games.ts. Run "npm run setup-games" before seeding.'
    );
  }

  const source = fs.readFileSync(GAMES_TS_PATH, 'utf-8');
  const match = source.match(/export const games: GameMeta\[\] = (\[[\s\S]*?\]);/);
  if (!match || !match[1]) {
    throw new Error('Could not parse games array from src/data/games.ts.');
  }

  return JSON.parse(match[1]);
}

function mapGamesForDb(sourceGames) {
  return sourceGames.map((game) => ({
    slug: game.slug,
    title: game.title,
    subject: game.subject,
    description: game.description,
    long_description: game.longDescription,
    link: game.iframeSrc,
    thumbnail: game.thumbnailSrc,
    metadata: {},
  }));
}

async function run() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production.');
  }

  loadEnvFile(path.join(ROOT_DIR, '.env.local'));
  loadEnvFile(path.join(ROOT_DIR, '.env'));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const mappedGames = mapGamesForDb(loadGamesFromGeneratedTs());

  if (forceReset) {
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .not('id', 'is', null);
    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    const { error: insertError } = await supabase.from('games').insert(mappedGames);
    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    console.log(`Seeded ${mappedGames.length} games with --force.`);
    return;
  }

  const { data: existingRows, error: existingError } = await supabase
    .from('games')
    .select('slug');
  if (existingError) {
    throw new Error(`Failed to fetch existing games: ${existingError.message}`);
  }

  const existingSlugs = new Set((existingRows ?? []).map((row) => row.slug));
  const updates = mappedGames.filter((game) => existingSlugs.has(game.slug));
  const inserts = mappedGames.filter((game) => !existingSlugs.has(game.slug));

  let updatedCount = 0;
  for (const game of updates) {
    const { error } = await supabase.from('games').update(game).eq('slug', game.slug);
    if (error) {
      throw new Error(`Failed to update "${game.slug}": ${error.message}`);
    }
    updatedCount += 1;
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from('games').insert(inserts);
    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }
  }

  console.log(
    `Seed complete: ${updatedCount} updated, ${inserts.length} inserted, 0 deleted.`
  );
}

run().catch((error) => {
  console.error('Game seed failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
