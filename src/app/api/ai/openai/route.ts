import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.model || !body.messages) {
    return NextResponse.json(
      { error: 'Missing required fields: model, messages' },
      { status: 400 }
    );
  }

  try {
    const completion = await client.chat.completions.create({
      model: body.model,
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
    });

    return NextResponse.json(completion);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenAI API request failed';
    const status = err instanceof OpenAI.APIError ? err.status : 500;
    console.error('OpenAI API error:', message);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
