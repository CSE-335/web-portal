// Auth callback — handles OAuth login and email change confirmation
// Uses @supabase/ssr for cookie-based session on the server
// For Google OAuth: creates user_profiles row with generated username on first login
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only allow same-origin redirect targets that look like a relative path. We
// reject `//host`, `/\host`, scheme-qualified URLs, and anything containing a
// CR/LF (header injection). Anything that doesn't pass falls back to "/".
function safeNextPath(value: string | null): string {
  if (!value) return "/";
  if (value.length > 512) return "/";
  if (/[\r\n\t]/.test(value)) return "/";
  if (!value.startsWith("/")) return "/";
  // Block protocol-relative redirects (//evil.com, /\evil.com, /\\evil.com).
  if (value.startsWith("//") || value.startsWith("/\\") || value.startsWith("\\")) return "/";
  // Block embedded scheme like "/foo?next=https://evil.com" being interpreted
  // unexpectedly downstream — accept only paths with safe path characters.
  // The path itself must not contain another scheme separator at position 0.
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}${next}?error=config`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  if (tokenHash && type === "email_change") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email_change",
    });
    if (error) {
      return NextResponse.redirect(`${origin}${next}?error=email_change`);
    }
    return NextResponse.redirect(`${origin}${next}?email_updated=true`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}${next}?error=no_code`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${next}?error=auth`);
  }

  return response;
}
