import type { AssistantResponse, GameEvent } from "@/features/assistant/types";
import { getAssistantGameIntegration } from "@/features/assistant/gameIntegration";

function buildUserMessageFallback(event: GameEvent): AssistantResponse {
  const rawMessage = event.additionalContext?.userMessage;
  const userMessage =
    typeof rawMessage === "string" ? rawMessage.trim() : "";

  const lower = userMessage.toLowerCase();
  const looksLikeMath =
    /\d/.test(userMessage) ||
    /[+\-*/=^()%]/.test(userMessage) ||
    /\b(math|algebra|equation|fraction|solve|multiply|divide)\b/.test(lower);
  const looksLikeScience =
    /\b(science|physics|chemistry|biology|atom|energy|force|cell)\b/.test(
      lower,
    );
  const looksLikeCode =
    /\b(code|coding|program|javascript|python|loop|function|bug)\b/.test(
      lower,
    );

  if (!userMessage) {
    return {
      lines: [
        {
          speaker: "Livvy",
          text: "Ask us any STEM question and we will work through it with you!",
          emotion: "encouraging",
        },
        {
          speaker: "Laurie",
          text: "Try sharing what you have already attempted so we can guide your next step.",
          emotion: "speaking",
        },
      ],
      summary: "The tutors are ready to help with a STEM question.",
    };
  }

  if (looksLikeMath) {
    return {
      lines: [
        {
          speaker: "Livvy",
          text: "Nice question. Let us break this into smaller math steps.",
          emotion: "thinking",
        },
        {
          speaker: "Laurie",
          text: "Start by identifying what is known, what is unknown, and which operation links them. Share your first step and we can check it together.",
          emotion: "speaking",
        },
      ],
      summary: "Math help: identify knowns, unknowns, and next operation.",
    };
  }

  if (looksLikeScience) {
    return {
      lines: [
        {
          speaker: "Livvy",
          text: "Ooh, science time! Let us reason from the core idea first.",
          emotion: "happy",
        },
        {
          speaker: "Laurie",
          text: "State the main concept in one sentence, then list evidence or observations that support it. If you share your draft explanation, we can refine it.",
          emotion: "speaking",
        },
      ],
      summary: "Science help: define the concept, then support with evidence.",
    };
  }

  if (looksLikeCode) {
    return {
      lines: [
        {
          speaker: "Livvy",
          text: "Debugging can feel tricky, but we can do it step by step.",
          emotion: "encouraging",
        },
        {
          speaker: "Laurie",
          text: "Describe the expected behavior, the actual behavior, and the exact error message. That usually reveals the next fix quickly.",
          emotion: "speaking",
        },
      ],
      summary: "Coding help: compare expected vs actual and include the error.",
    };
  }

  return {
    lines: [
      {
        speaker: "Livvy",
        text: `I hear you: "${userMessage.slice(0, 120)}${userMessage.length > 120 ? "..." : ""}"`,
        emotion: "thinking",
      },
      {
        speaker: "Laurie",
        text: "We can help with STEM topics. Tell us the exact problem and what you have tried so far, and we will guide your next step.",
        emotion: "speaking",
      },
    ],
    summary: "General tutoring fallback asking for clear STEM context.",
  };
}

export function getStaticFallback(event: GameEvent): AssistantResponse {
  const profile = getAssistantGameIntegration(event.gameId);
  const gameFallback = profile?.staticFallbacks?.[event.eventType];
  if (gameFallback && event.eventType !== "user_message") {
    return gameFallback as AssistantResponse;
  }

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
      lines: [],
      summary: "",
    },
  };

  if (event.eventType === "user_message") {
    return buildUserMessageFallback(event);
  }

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
