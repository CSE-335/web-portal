import type { AssistantResponse, GameEvent } from "@/features/assistant/types";

export function getStaticFallback(event: GameEvent): AssistantResponse {
  const fallbacks: Record<string, AssistantResponse> = {
    incorrect_submission: {
      lines: [
        {
          speaker: "Livvy",
          text: "Hmm, that doesn't look quite right. Want to try again?",
          emotion: "confused",
        },
        {
          speaker: "Laurie",
          text: "Take another look at the problem. Think about what each part is doing.",
          emotion: "encouraging",
        },
      ],
      summary: "The answer was incorrect. Review the problem and try again.",
    },
    hint_request: {
      lines: [
        {
          speaker: "Livvy",
          text: "Okay, let me think about this with you...",
          emotion: "thinking",
        },
        {
          speaker: "Laurie",
          text: "Try breaking the problem into smaller steps. What's the first thing you need to figure out?",
          emotion: "speaking",
        },
      ],
      summary: "Break the problem into smaller steps.",
    },
    correct_submission: {
      lines: [
        {
          speaker: "Livvy",
          text: "Nice work! You got it!",
          emotion: "happy",
        },
        {
          speaker: "Laurie",
          text: "Well done. That shows solid understanding of the concept.",
          emotion: "happy",
        },
      ],
      summary: "Correct answer — great job!",
    },
    user_message: {
      lines: [
        {
          speaker: "Livvy",
          text: "Ooh, great question! Let me think about that...",
          emotion: "thinking",
        },
        {
          speaker: "Laurie",
          text: "I'd love to help, but there are issues on our end. Please send in a ticket to our support team.",
          emotion: "speaking",
        },
      ],
      summary: "API key needed for freeform chat.",
    },
  };

  return (
    fallbacks[event.eventType] || {
      lines: [
        {
          speaker: "Laurie" as const,
          text: "Let me know if you need any help!",
          emotion: "idle" as const,
        },
      ],
      summary: "The tutors are here to help.",
    }
  );
}
