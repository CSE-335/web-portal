import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get('file');
  const model = formData.get('model');

  if (!file || !model) {
    return NextResponse.json(
      { error: 'Missing required fields: file, model' },
      { status: 400 }
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const transcription = await client.audio.transcriptions.create({
      file: file as File,
      model: model as string,
      language: (formData.get('language') as string) || undefined,
      prompt: (formData.get('prompt') as string) || undefined,
      response_format: (formData.get('response_format') as any) || undefined,
      temperature: formData.has('temperature')
        ? parseFloat(formData.get('temperature') as string)
        : undefined,
    });

    return NextResponse.json(transcription, {
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    });
  } catch (err: any) {
    console.error('OpenAI Whisper error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Whisper transcription failed' },
      { status: err.status || 500 }
    );
  }
}
