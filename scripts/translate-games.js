/* eslint-disable @typescript-eslint/no-require-imports -- Node CJS script */
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
 *   TRANSLATION_PROVIDER=openai|libre|custom
 *   OPENAI_API_KEY
 *   OPENAI_MODEL (default: gpt-4.1-mini)
 *   TRANSLATION_PROVIDER_URL (required for libre/custom)
 *   TRANSLATION_PROVIDER_KEY (required for custom)
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
const REQUEST_TIMEOUT_MS = Number(process.env.TRANSLATION_TIMEOUT_MS || 45000);

function getTranslationProvider() {
  return (process.env.TRANSLATION_PROVIDER || "openai").toLowerCase();
}

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

function parseSlugArg() {
  const arg = process.argv.find((v) => v.startsWith("--slug="));
  return arg ? arg.replace("--slug=", "").trim() : null;
}

function parseOnlyMissingArg() {
  return process.argv.includes("--only-missing");
}

function buildSourceHash(row) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify([row.title, row.description, row.long_description]))
    .digest("hex");
}

function extractOpenAiText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((p) => (typeof p === "string" ? p : String(p ?? "")));
  }
  if (typeof value === "string" && value.trim()) {
    return [value];
  }
  return [];
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function translateText({ text, sourceLocale, targetLocale }) {
  const provider = getTranslationProvider();
  if (!text || sourceLocale === targetLocale) return text;

  if (provider === "openai") {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!openAiApiKey) {
      // Safe local fallback for development: keep source text.
      return text;
    }

    const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a professional translator for educational game descriptions. Return only the translated text with no commentary.",
          },
          {
            role: "user",
            content: `Translate from ${sourceLocale} to ${targetLocale}:\n\n${text}`,
          },
        ],
      }),
    }, REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI translation failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const translatedText = extractOpenAiText(data);
    if (!translatedText) {
      throw new Error(
        `OpenAI response missing translated text. Response keys: ${Object.keys(data || {}).join(", ")}`
      );
    }
    return translatedText;
  }

  if (provider === "libre") {
    const endpoint = process.env.TRANSLATION_PROVIDER_URL;
    if (!endpoint) {
      // Safe local fallback for development: keep source text.
      return text;
    }

    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLocale,
        target: targetLocale,
        format: "text",
      }),
    }, REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LibreTranslate failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    if (!data?.translatedText || typeof data.translatedText !== "string") {
      throw new Error("LibreTranslate response missing translatedText.");
    }
    return data.translatedText;
  }

  if (provider === "custom") {
    const endpoint = process.env.TRANSLATION_PROVIDER_URL;
    const apiKey = process.env.TRANSLATION_PROVIDER_KEY;
    if (!endpoint || !apiKey) {
      // Safe local fallback for development: keep source text.
      return text;
    }

    const response = await fetchWithTimeout(endpoint, {
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
    }, REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Custom translation API failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    if (!data?.translatedText || typeof data.translatedText !== "string") {
      throw new Error("Custom translation API response missing translatedText.");
    }
    return data.translatedText;
  }

  throw new Error(
    `Unsupported TRANSLATION_PROVIDER="${provider}". Use openai, libre, or custom.`
  );
}

async function translateGameContentOpenAi({ game, sourceLocale, targetLocale }) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!openAiApiKey) {
    return {
      title: game.title,
      description: game.description,
      longDescription: normalizeParagraphs(game.long_description),
    };
  }

  const sourceParagraphs = normalizeParagraphs(game.long_description);

  const response = await fetchWithTimeout(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a professional translator for educational game descriptions. Return only valid JSON.",
          },
          {
            role: "user",
            content: `Translate this game content from ${sourceLocale} to ${targetLocale}. Keep tone educational and concise.

Return strict JSON with this exact shape:
{"title":"...","description":"...","longDescription":["..."]}

Rules:
- Keep longDescription array length exactly the same as source.
- No markdown, no comments, no extra keys.

Source JSON:
${JSON.stringify({
  title: game.title,
  description: game.description,
  longDescription: sourceParagraphs,
})}`,
          },
        ],
      }),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI translation failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = extractOpenAiText(data);
  const parsed = extractJsonObject(text);
  if (!parsed) {
    throw new Error("OpenAI returned non-JSON translation content.");
  }

  const longDescription = Array.isArray(parsed.longDescription)
    ? parsed.longDescription.map((p) => (typeof p === "string" ? p : String(p ?? "")))
    : [];

  // Enforce shape and safe fallback lengths.
  const normalizedParagraphs =
    longDescription.length === sourceParagraphs.length
      ? longDescription
      : sourceParagraphs.map((_, idx) => longDescription[idx] ?? sourceParagraphs[idx]);

  return {
    title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title : game.title,
    description:
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description
        : game.description,
    longDescription: normalizedParagraphs,
  };
}

async function translateGameContentFallback({ game, sourceLocale, targetLocale }) {
  const translatedTitle = await translateText({
    text: game.title,
    sourceLocale,
    targetLocale,
  });
  const translatedDescription = await translateText({
    text: game.description,
    sourceLocale,
    targetLocale,
  });
  const translatedLongDescription = [];
  for (const paragraph of normalizeParagraphs(game.long_description)) {
    translatedLongDescription.push(
      await translateText({
        text: paragraph,
        sourceLocale,
        targetLocale,
      })
    );
  }
  return {
    title: translatedTitle,
    description: translatedDescription,
    longDescription: translatedLongDescription,
  };
}

async function run() {
  if (process.env.NODE_ENV === "production") {
    console.log("Running translate-games in production mode.");
  }

  loadEnvFile(path.join(ROOT_DIR, ".env.local"));
  loadEnvFile(path.join(ROOT_DIR, ".env"));
  console.log(`Translation provider: ${getTranslationProvider()}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const targetLocales = parseLocalesArg();
  const targetSlug = parseSlugArg();
  const onlyMissing = parseOnlyMissingArg();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let gamesQuery = supabase
    .from("games")
    .select("id, slug, title, description, long_description")
    .eq("is_published", true);
  if (targetSlug) {
    gamesQuery = gamesQuery.eq("slug", targetSlug);
  }
  const { data: games, error: gamesError } = await gamesQuery;

  if (gamesError) throw new Error(`Failed to fetch games: ${gamesError.message}`);
  console.log(`Found ${(games ?? []).length} published game(s).`);
  if (targetSlug) {
    console.log(`Target slug filter: ${targetSlug}`);
  }
  if (onlyMissing) {
    console.log("Only-missing mode: enabled");
  }
  const provider = getTranslationProvider();

  let writeCount = 0;
  for (const game of games ?? []) {
    console.log(`Processing game: ${game.slug}`);
    const sourceHash = buildSourceHash(game);

    for (const locale of targetLocales) {
      if (locale === DEFAULT_SOURCE_LOCALE) continue;
      console.log(`Translating ${game.slug} -> ${locale}`);

      if (onlyMissing) {
        const { data: existingRow, error: existingError } = await supabase
          .from("game_translations")
          .select("id")
          .eq("game_id", game.id)
          .eq("locale", locale)
          .eq("source_hash", sourceHash)
          .maybeSingle();
        if (existingError) {
          throw new Error(
            `Failed checking existing translation for ${game.slug} (${locale}): ${existingError.message}`
          );
        }
        if (existingRow) {
          console.log(`Skipping ${game.slug} -> ${locale} (already translated for current source hash)`);
          continue;
        }
      }

      let translatedTitle;
      let translatedDescription;
      let translatedLongDescription;
      if (provider === "openai") {
        let translated;
        try {
          translated = await translateGameContentOpenAi({
            game,
            sourceLocale: DEFAULT_SOURCE_LOCALE,
            targetLocale: locale,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(
            `Structured OpenAI translation failed for ${game.slug} (${locale}): ${message}. Falling back to per-field translation.`
          );
          translated = await translateGameContentFallback({
            game,
            sourceLocale: DEFAULT_SOURCE_LOCALE,
            targetLocale: locale,
          });
        }
        translatedTitle = translated.title;
        translatedDescription = translated.description;
        translatedLongDescription = translated.longDescription;
      } else {
        const translated = await translateGameContentFallback({
          game,
          sourceLocale: DEFAULT_SOURCE_LOCALE,
          targetLocale: locale,
        });
        translatedTitle = translated.title;
        translatedDescription = translated.description;
        translatedLongDescription = translated.longDescription;
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
