import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      issues,
      futureIdeas,
      returnLikelihood,
      comments,
    } = body;

    console.log("New feedback submission:");
    console.log({
      name,
      email,
      issues,
      futureIdeas,
      returnLikelihood,
      comments,
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