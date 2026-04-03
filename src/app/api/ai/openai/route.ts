import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.model || !body.messages) {
    return NextResponse.json(
      { error: 'Missing required fields: model, messages' },
      { status: 400 }
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await client.chat.completions.create({
      model: body.model,
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
    });

    return NextResponse.json(completion);
  } catch (err: any) {
    console.error('OpenAI API error:', err.message);
    return NextResponse.json(
      { error: err.message || 'OpenAI API request failed' },
      { status: err.status || 500 }
    );
  }
}
