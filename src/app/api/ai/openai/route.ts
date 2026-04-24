import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allowlist of models the proxy is willing to invoke. Without this, a caller
// can pick an arbitrarily expensive model on our account.
const DEFAULT_ALLOWED_MODELS = [
  'gpt-4o-mini',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'o4-mini',
];
const ALLOWED_MODELS = new Set(
  (process.env.OPENAI_ALLOWED_MODELS?.split(',').map((m) => m.trim()).filter(Boolean) ??
    DEFAULT_ALLOWED_MODELS),
);

const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_TOKENS_CAP = 2_000;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.role === 'string' &&
    ['system', 'user', 'assistant'].includes(v.role) &&
    typeof v.content === 'string'
  );
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { model, messages, max_tokens, temperature } = body as {
    model?: unknown;
    messages?: unknown;
    max_tokens?: unknown;
    temperature?: unknown;
  };

  if (typeof model !== 'string' || !ALLOWED_MODELS.has(model)) {
    return NextResponse.json(
      { error: 'Model is not permitted by this proxy' },
      { status: 400 },
    );
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `messages must be an array with 1..${MAX_MESSAGES} items` },
      { status: 400 },
    );
  }

  const cleanMessages: ChatMessage[] = [];
  for (const m of messages) {
    if (!isChatMessage(m)) {
      return NextResponse.json(
        { error: 'Each message must be { role, content: string }' },
        { status: 400 },
      );
    }
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `Message content exceeds ${MAX_MESSAGE_CHARS} characters` },
        { status: 413 },
      );
    }
    cleanMessages.push({ role: m.role, content: m.content });
  }

  let cappedMaxTokens: number | undefined;
  if (max_tokens !== undefined) {
    if (typeof max_tokens !== 'number' || !Number.isFinite(max_tokens) || max_tokens <= 0) {
      return NextResponse.json({ error: 'max_tokens must be a positive number' }, { status: 400 });
    }
    cappedMaxTokens = Math.min(Math.floor(max_tokens), MAX_TOKENS_CAP);
  } else {
    cappedMaxTokens = MAX_TOKENS_CAP;
  }

  let safeTemperature: number | undefined;
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || !Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
      return NextResponse.json({ error: 'temperature must be between 0 and 2' }, { status: 400 });
    }
    safeTemperature = temperature;
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: cleanMessages,
      max_tokens: cappedMaxTokens,
      temperature: safeTemperature,
    });

    return NextResponse.json(completion);
  } catch (err: unknown) {
    const status = err instanceof OpenAI.APIError ? err.status : 500;
    // Don't echo upstream error messages to the caller — they can leak
    // organization IDs, model names, or other internal details.
    console.error('OpenAI API error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Upstream AI request failed' },
      { status: status ?? 500 },
    );
  }
}
