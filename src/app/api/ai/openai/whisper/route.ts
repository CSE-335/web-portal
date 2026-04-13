import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { AudioResponseFormat } from 'openai/resources/audio';
import { enforceRateLimit } from '@/lib/upstashRateLimit';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const rateLimitResult = await enforceRateLimit({
    request: req,
    prefix: 'ai-whisper-api',
    limit: 20,
    window: '1 m',
  });
  if (rateLimitResult) {
    return NextResponse.json(rateLimitResult.body, {
      status: rateLimitResult.status,
      headers: rateLimitResult.headers,
    });
  }

  const formData = await req.formData();

  const file = formData.get('file');
  const model = formData.get('model');

  if (!file || !model) {
    return NextResponse.json(
      { error: 'Missing required fields: file, model' },
      { status: 400 }
    );
  }

  try {
    const transcription = await client.audio.transcriptions.create({
      file: file as File,
      model: model as string,
      language: (formData.get('language') as string) || undefined,
      prompt: (formData.get('prompt') as string) || undefined,
      response_format: (formData.get('response_format') as AudioResponseFormat) || undefined,
      temperature: formData.has('temperature')
        ? parseFloat(formData.get('temperature') as string)
        : undefined,
    });

    return NextResponse.json(transcription);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Whisper transcription failed';
    const status = err instanceof OpenAI.APIError ? err.status : 500;
    console.error('OpenAI Whisper error:', message);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
