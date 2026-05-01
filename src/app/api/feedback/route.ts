import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const feedbackSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(320).optional().or(z.literal("")).default(""),
  issues: z.string().trim().min(1).max(8000),
  futureIdeas: z.string().trim().max(8000).optional().default(""),
  returnLikelihood: z.string().trim().max(100).optional().default(""),
  comments: z.string().trim().max(8000).optional().default(""),
});

function toReadableLikelihood(value: string) {
  if (!value) return "Not provided";
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

async function resolveFeedbackRecipientEmail() {
  const admin = getSupabaseAdmin();

  const settingsKey = process.env.FEEDBACK_SETTINGS_KEY || "feedback_recipient_email";
  const fallbackRecipient = process.env.FEEDBACK_RECIPIENT_EMAIL || "";

  try {
    const { data, error } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", settingsKey)
      .maybeSingle();

    if (!error && typeof data?.value === "string" && data.value.trim()) {
      return data.value.trim();
    }
  } catch (error) {
    console.warn("[feedback] failed to read recipient email from Supabase settings", error);
  }

  return fallbackRecipient.trim();
}

async function sendFeedbackEmail(payload: {
  name: string;
  email: string;
  answer: string;
  features: string;
  returnLikelihood: string;
  comments: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL || "no-reply@example.com";
  const toEmail = await resolveFeedbackRecipientEmail();

  if (!apiKey || !toEmail) {
    console.warn("[feedback] email not sent - missing RESEND_API_KEY or recipient email");
    return { sent: false as const };
  }

  const submittedAt = new Date().toISOString();
  const text = [
    "New feedback submission",
    `Submitted at: ${submittedAt}`,
    "",
    `Name: ${payload.name || "Not provided"}`,
    `Email: ${payload.email || "Not provided"}`,
    `Answer: ${payload.answer || "Not provided"}`,
    `Features: ${payload.features || "Not provided"}`,
    `Return likelihood: ${toReadableLikelihood(payload.returnLikelihood)}`,
    `Comments: ${payload.comments || "Not provided"}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: "New feedback submission",
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("[feedback] failed to send email", details);
    return { sent: false as const };
  }

  return { sent: true as const };
}

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: Request) {
  try {
    // Security: validate body size before parsing
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

    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
    }

    const { name, email, issues, futureIdeas, returnLikelihood, comments } = parsed.data;

    // Don't log raw PII (name/email) — log a redacted summary instead so an
    // operator can see that something came in without persisting personal
    // data in plaintext logs.
    console.log("[feedback] submission received", {
      hasName: !!name,
      hasEmail: !!email,
      hasIssues: !!issues,
      hasFutureIdeas: !!futureIdeas,
      hasComments: !!comments,
      returnLikelihood: returnLikelihood || null,
      submittedAt: new Date().toISOString(),
    });

    const admin = getSupabaseAdmin();

    const insertPayload = {
      name,
      email,
      answer: issues,
      features: futureIdeas,
      return_likelihood: returnLikelihood,
      comments,
    };

    const { error: insertError } = await admin.from("feedback").insert(insertPayload);

    if (insertError) {
      console.error("[feedback] failed to insert submission", insertError);
      return NextResponse.json(
        { error: "Failed to save feedback to database." },
        { status: 500 }
      );
    }

    const emailResult = await sendFeedbackEmail({
      name,
      email,
      answer: issues,
      features: futureIdeas,
      returnLikelihood,
      comments,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.sent,
      message: "Feedback submitted successfully.",
    });
  } catch (error) {
    console.error("[feedback] submission error", error);
    return NextResponse.json(
      { error: "Failed to process feedback submission." },
      { status: 500 }
    );
  }
}
