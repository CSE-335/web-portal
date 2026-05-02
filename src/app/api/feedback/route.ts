import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME_CHARS = 200;
const MAX_EMAIL_CHARS = 254;
const MAX_FREEFORM_CHARS = 4_000;
const RETURN_LIKELIHOOD_VALUES = new Set([
  "very_likely",
  "likely",
  "neutral",
  "unlikely",
  "very_unlikely",
]);
// Pragmatic email shape check — server side validation only, the user-facing
// form should still validate too.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > max) return null;
  return trimmed;
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      name,
      email,
      issues,
      futureIdeas,
      returnLikelihood,
      comments,
    } = body as Record<string, unknown>;

    const cleanName = clean(name, MAX_NAME_CHARS);
    const cleanEmail = clean(email, MAX_EMAIL_CHARS);
    const cleanIssues = clean(issues, MAX_FREEFORM_CHARS);
    const cleanFutureIdeas = clean(futureIdeas, MAX_FREEFORM_CHARS);
    const cleanComments = clean(comments, MAX_FREEFORM_CHARS);

    if (cleanEmail !== null && !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let cleanReturn: string | null = null;
    if (returnLikelihood !== undefined && returnLikelihood !== null && returnLikelihood !== "") {
      if (typeof returnLikelihood !== "string" || !RETURN_LIKELIHOOD_VALUES.has(returnLikelihood)) {
        return NextResponse.json({ error: "Invalid returnLikelihood" }, { status: 400 });
      }
      cleanReturn = returnLikelihood;
    }

    // Don't log raw PII (name/email) — log a redacted summary instead so an
    // operator can see that something came in without persisting personal
    // data in plaintext logs.
    console.log("[feedback] submission received", {
      hasName: cleanName !== null,
      hasEmail: cleanEmail !== null,
      hasIssues: cleanIssues !== null,
      hasFutureIdeas: cleanFutureIdeas !== null,
      hasComments: cleanComments !== null,
      returnLikelihood: cleanReturn,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully.",
    });
  } catch (error) {
    console.error("Feedback submission error:", error);

    return NextResponse.json(
      { error: "Failed to process feedback submission." },
      { status: 500 }
    );
  }
}
