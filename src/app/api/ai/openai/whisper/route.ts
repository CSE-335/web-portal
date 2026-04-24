import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { AudioResponseFormat } from 'openai/resources/audio';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_WHISPER_MODELS = new Set(['whisper-1', 'gpt-4o-mini-transcribe', 'gpt-4o-transcribe']);
const ALLOWED_RESPONSE_FORMATS = new Set(['json', 'text', 'srt', 'verbose_json', 'vtt']);
const ALLOWED_AUDIO_MIME = [
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
];
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_PROMPT_CHARS = 1_000;

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 415 });
  }

  const declaredLength = Number(req.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_AUDIO_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'Audio file too large' }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const model = formData.get('model');

  if (!(file instanceof File) || typeof model !== 'string') {
    return NextResponse.json(
      { error: 'Missing required fields: file, model' },
      { status: 400 }
    );
  }

  if (!ALLOWED_WHISPER_MODELS.has(model)) {
    return NextResponse.json({ error: 'Model is not permitted by this proxy' }, { status: 400 });
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Audio file too large' }, { status: 413 });
  }

  const fileType = (file.type || '').toLowerCase();
  if (fileType && !ALLOWED_AUDIO_MIME.some((mime) => fileType.startsWith(mime))) {
    return NextResponse.json({ error: 'Unsupported audio MIME type' }, { status: 415 });
  }

  const language = formData.get('language');
  const prompt = formData.get('prompt');
  const responseFormat = formData.get('response_format');
  const temperatureRaw = formData.get('temperature');

  if (prompt != null && (typeof prompt !== 'string' || prompt.length > MAX_PROMPT_CHARS)) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
  }

  if (language != null && (typeof language !== 'string' || !/^[a-zA-Z-]{1,10}$/.test(language))) {
    return NextResponse.json({ error: 'Invalid language code' }, { status: 400 });
  }

  if (responseFormat != null) {
    if (typeof responseFormat !== 'string' || !ALLOWED_RESPONSE_FORMATS.has(responseFormat)) {
      return NextResponse.json({ error: 'Invalid response_format' }, { status: 400 });
    }
  }

  let temperature: number | undefined;
  if (temperatureRaw != null) {
    if (typeof temperatureRaw !== 'string') {
      return NextResponse.json({ error: 'Invalid temperature' }, { status: 400 });
    }
    const parsed = Number.parseFloat(temperatureRaw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      return NextResponse.json({ error: 'temperature must be between 0 and 1' }, { status: 400 });
    }
    temperature = parsed;
  }

  try {
    const transcription = await client.audio.transcriptions.create({
      file,
      model,
      language: typeof language === 'string' ? language : undefined,
      prompt: typeof prompt === 'string' ? prompt : undefined,
      response_format: (typeof responseFormat === 'string'
        ? (responseFormat as AudioResponseFormat)
        : undefined),
      temperature,
    });

    return NextResponse.json(transcription);
  } catch (err: unknown) {
    const status = err instanceof OpenAI.APIError ? err.status : 500;
    console.error('OpenAI Whisper error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Upstream transcription request failed' },
      { status: status ?? 500 }
    );
  }
}
