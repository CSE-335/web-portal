# Using the AI Proxy Routes

The web portal provides proxy routes that let games make AI API calls (OpenAI, etc.) without exposing API keys in client-side code. All AI requests are rate-limited via a token cookie that the portal manages automatically.

## Available Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/ai/openai` | OpenAI chat completions proxy |
| `POST /api/ai/openai/whisper` | OpenAI Whisper transcription proxy |
| `POST /api/assistant` | STEM tutor assistant |

## How It Works

1. When a user visits a game page, the portal sets an `httpOnly` cookie containing a signed token
2. The browser automatically includes this cookie on all API requests to `/api/*`
3. Middleware validates the token and checks rate limits before the request reaches the route handler
4. Games don't need to manage tokens — just make normal `fetch` calls

## Making AI Requests From a Game

No token setup required. Just call the endpoint:

```js
async function callAI(messages, options = {}) {
  const res = await fetch('/api/ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model ?? 'gpt-4o-mini',
      messages,
      max_tokens: options.maxTokens ?? 2000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
}

// Usage
const response = await callAI([
  { role: 'system', content: 'You are a helpful tutor.' },
  { role: 'user', content: 'Explain photosynthesis.' },
]);

const reply = response.choices[0].message.content;
```

## Rate Limits

| User type | Limit |
|---|---|
| Logged in | 50 requests per 15 minutes |
| Not logged in | 10 requests per 15 minutes |

When the rate limit is exceeded, the API returns a `429` status code with `{ "error": "Too many requests" }`.

The `X-RateLimit-Remaining` header is included in every response so your game can track remaining requests if needed.

## Token Refresh

The token cookie expires after 15 minutes. It is automatically refreshed when the user navigates to a game page. For long play sessions without page navigation, the portal can call `GET /api/auth/game-token` to re-issue the cookie.

## Local Development

**No setup required.** In development mode (`npm run dev`), the middleware skips all token validation and rate limiting. Games can call the AI proxy routes directly without any token.

This means:
- Games running standalone (outside the portal) work as-is during development
- No Upstash or token configuration needed locally
- AI routes are open and unrestricted in dev mode

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `403 Missing game token` | User didn't load a game page first | Navigate to a game page on the portal — the cookie is set automatically |
| `403 Invalid or expired token` | Token expired (15 min) | Reload the game page, or call `GET /api/auth/game-token` |
| `429 Too many requests` | Rate limit exceeded | Wait for the 15-minute window to reset, or reduce request frequency |
