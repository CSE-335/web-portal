/**
 * Background translation sync for game descriptions.
 *
 * Example:
 *   node scripts/translate-games.js --locales=es,fr,de,ja
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional env:
 *   TRANSLATION_PROVIDER_URL
 *   TRANSLATION_PROVIDER_KEY
 *
 * Notes:
 * - This script is designed for cron/background workers.
 * - It only upserts when source_hash changes.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const ROOT_DIR = path.join(__dirname, "..");
const DEFAULT_SOURCE_LOCALE = "en";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
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

function parseLocalesArg() {
  const arg = process.argv.find((v) => v.startsWith("--locales="));
  if (!arg) return ["es", "fr", "de", "ja"];
  return arg
    .replace("--locales=", "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildSourceHash(row) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify([row.title, row.description, row.long_description]))
    .digest("hex");
}

async function translateText({ text, sourceLocale, targetLocale }) {
  const endpoint = process.env.TRANSLATION_PROVIDER_URL;
  const apiKey = process.env.TRANSLATION_PROVIDER_KEY;
  if (!endpoint || !apiKey) {
    // Safe local fallback for development: keep source text.
    return text;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      sourceLocale,
      targetLocale,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Translation API failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data?.translatedText || typeof data.translatedText !== "string") {
    throw new Error("Translation API response missing translatedText.");
  }

  return data.translatedText;
}

async function run() {
  if (process.env.NODE_ENV === "production") {
    console.log("Running translate-games in production mode.");
  }

  loadEnvFile(path.join(ROOT_DIR, ".env.local"));
  loadEnvFile(path.join(ROOT_DIR, ".env"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const targetLocales = parseLocalesArg();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("id, slug, title, description, long_description")
    .eq("is_published", true);

  if (gamesError) throw new Error(`Failed to fetch games: ${gamesError.message}`);

  let writeCount = 0;
  for (const game of games ?? []) {
    const sourceHash = buildSourceHash(game);

    for (const locale of targetLocales) {
      if (locale === DEFAULT_SOURCE_LOCALE) continue;

      const translatedTitle = await translateText({
        text: game.title,
        sourceLocale: DEFAULT_SOURCE_LOCALE,
        targetLocale: locale,
      });
      const translatedDescription = await translateText({
        text: game.description,
        sourceLocale: DEFAULT_SOURCE_LOCALE,
        targetLocale: locale,
      });

      const translatedLongDescription = [];
      for (const paragraph of game.long_description ?? []) {
        translatedLongDescription.push(
          await translateText({
            text: paragraph,
            sourceLocale: DEFAULT_SOURCE_LOCALE,
            targetLocale: locale,
          })
        );
      }

      const { error: upsertError } = await supabase.from("game_translations").upsert(
        {
          game_id: game.id,
          locale,
          title: translatedTitle,
          description: translatedDescription,
          long_description: translatedLongDescription,
          source_hash: sourceHash,
          status: "machine",
          translated_at: new Date().toISOString(),
        },
        { onConflict: "game_id,locale,source_hash" }
      );

      if (upsertError) {
        throw new Error(`Failed to upsert ${game.slug} (${locale}): ${upsertError.message}`);
      }

      writeCount += 1;
      console.log(`Translated ${game.slug} -> ${locale}`);
    }
  }

  console.log(`Translation sync complete. Rows upserted: ${writeCount}`);
}

run().catch((error) => {
  console.error("translate-games failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
