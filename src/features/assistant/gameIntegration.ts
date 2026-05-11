import type { AssistantEventType, AssistantResponse } from "./types";
import { games, getGameBySlug, type GameMeta } from "@/data/games";

/**
 * Per-game web assistant tuning: LLM context, session defaults, and optional
 * static fallbacks when no model is configured.
 *
 * **New games:** Any slug present in `src/data/games.ts` (from `game.json` via
 * `generate-games.mjs`) gets a profile automatically from title, subject,
 * description, and longDescription. Optional `assistant-tutor-brief` and
 * `assistant-target-concept` in `game.json` override the derived brief / topic.
 * Optional `assistant-mistake-guide` lists common slips so wrong-answer tutoring stays concrete.
 * Optional `assistant-dialogue-constraints` adds hub tutor guardrails (e.g. avoid discussing score).
 * Add an entry in `INTEGRATION_OVERRIDES` only for custom static fallbacks.
 */
export type AssistantGameIntegration = {
  slug: string;
  title: string;
  subject: string;
  /** Compact briefing injected into the system prompt. */
  tutorBrief: string;
  /**
   * Optional: typical wrong answers, UI pitfalls, or misconceptions (from game.json
   * `assistant-mistake-guide`). Helps the model explain *this* game's slips, not generic STEM.
   */
  mistakeGuide?: string;
  /**
   * Optional: extra dialogue rules from game.json `assistant-dialogue-constraints`
   * (injected into the assistant system/user prompts).
   */
  dialogueConstraints?: string;
  /** Default learning label for chat before iframe events. */
  defaultTargetConcept: string;
  /** Optional static fallbacks keyed by event type (subset). */
  staticFallbacks?: Partial<
    Record<
      AssistantEventType,
      Pick<AssistantResponse, "lines" | "summary"> | AssistantResponse
    >
  >;
};

const MAX_TUTOR_BRIEF_CHARS = 2000;
const MAX_MISTAKE_GUIDE_CHARS = 1200;
const MAX_DIALOGUE_CONSTRAINTS_CHARS = 1200;

type AssistantIntegrationOverride = Partial<
  Omit<AssistantGameIntegration, "slug">
>;

/** Hub-only polish: curated offline lines. Everything else comes from GameMeta. */
const INTEGRATION_OVERRIDES: Record<string, AssistantIntegrationOverride> = {
  pythongame: {
    staticFallbacks: {
      incorrect_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "The robot did not do what we expected—maybe the logic is off by one case?",
            emotion: "confused",
          },
          {
            speaker: "Laurie",
            text: "Re-read the level goal, then trace your code line by line as if you were the robot. Check loops, comparisons, and off-by-one moves.",
            emotion: "encouraging",
          },
        ],
        summary: "Python level: trace logic and control flow against the maze goal.",
      },
      hint_request: {
        lines: [
          {
            speaker: "Livvy",
            text: "Okay—what is the smallest thing the program must do first to move safely?",
            emotion: "thinking",
          },
          {
            speaker: "Laurie",
            text: "Name one sensor or condition the level cares about, then write the minimal snippet that handles only that case before generalizing.",
            emotion: "speaking",
          },
        ],
        summary: "Hint: reduce to the first safe action or condition.",
      },
      correct_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "Yes! The code and the robot finally agree!",
            emotion: "happy",
          },
          {
            speaker: "Laurie",
            text: "Nice—your Python matched the puzzle rules. See if you can state in one sentence *why* this solution works for next time.",
            emotion: "happy",
          },
        ],
        summary: "Correct Python solution—reinforce the governing rule.",
      },
    },
  },
  "human-motion": {
    staticFallbacks: {
      incorrect_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "Hmm, the trace on screen does not match how I moved the phone.",
            emotion: "confused",
          },
          {
            speaker: "Laurie",
            text: "Compare a calm hold to a quick shake: which axis spikes, and does the sign match the direction you pushed? Re-run once changing only one motion at a time.",
            emotion: "speaking",
          },
        ],
        summary: "Motion lab: relate axis signs to movement and isolate one variable.",
      },
      hint_request: {
        lines: [
          {
            speaker: "Livvy",
            text: "Should we think about the phone axes one at a time?",
            emotion: "thinking",
          },
          {
            speaker: "Laurie",
            text: "Try tilting only pitch, then only roll—watch which graph wiggles. Name the axis that matters for the current challenge before combining motions.",
            emotion: "speaking",
          },
        ],
        summary: "Hint: decouple axes and watch the corresponding signal.",
      },
      correct_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "That motion trace looks like what I actually did!",
            emotion: "happy",
          },
          {
            speaker: "Laurie",
            text: "Great—your intuition for acceleration and the sensor plot line up. Say it back: how did a sharper move change the curve compared to a gentle one?",
            emotion: "happy",
          },
        ],
        summary: "Correct motion interpretation—relate gesture size to the graph.",
      },
    },
  },
  "matrix-meadow": {
    staticFallbacks: {
      incorrect_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "The monster shape is still off—did we mix up rows and columns?",
            emotion: "confused",
          },
          {
            speaker: "Laurie",
            text: "Recompute the product stepwise: which row dotted with which column produces each entry? Check whether the stretch you see matches those factors.",
            emotion: "encouraging",
          },
        ],
        summary: "Matrix error: verify row·column products vs the visible transform.",
      },
      hint_request: {
        lines: [
          {
            speaker: "Livvy",
            text: "Maybe we only need to scale one direction first?",
            emotion: "thinking",
          },
          {
            speaker: "Laurie",
            text: "Identify the target width and height ratios versus the start shape. Build a diagonal scaling matrix for those two factors before adding shear or rotation.",
            emotion: "speaking",
          },
        ],
        summary: "Hint: separate scaling on each axis from fancier transforms.",
      },
      correct_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "The creature matches—nice matrix instincts!",
            emotion: "happy",
          },
          {
            speaker: "Laurie",
            text: "Solid work. In one line, which matrix entries were doing the heavy lifting for that match?",
            emotion: "happy",
          },
        ],
        summary: "Correct matrix transform—name the decisive entries.",
      },
    },
  },
  "sonic-lab": {
    staticFallbacks: {
      incorrect_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "This spectrum does not line up with what I thought I heard.",
            emotion: "confused",
          },
          {
            speaker: "Laurie",
            text: "Replay the clip: was the input clipping or too quiet? Then check whether the peak you expect moved when you changed pitch or loudness.",
            emotion: "speaking",
          },
        ],
        summary: "Audio lab: validate recording level then relate pitch to peak shifts.",
      },
      hint_request: {
        lines: [
          {
            speaker: "Livvy",
            text: "Should we hum a steady note and watch one peak?",
            emotion: "thinking",
          },
          {
            speaker: "Laurie",
            text: "Hold a single comfortable pitch for a few seconds, then read the strongest frequency bin. Compare that Hz to a reference tone button if the lab provides one.",
            emotion: "speaking",
          },
        ],
        summary: "Hint: isolate a sustained tone and read its dominant frequency.",
      },
      correct_submission: {
        lines: [
          {
            speaker: "Livvy",
            text: "That fingerprint finally clicks with my voice!",
            emotion: "happy",
          },
          {
            speaker: "Laurie",
            text: "Excellent. Summarize how a higher pitch shifted the pattern versus a lower one so you own the idea.",
            emotion: "happy",
          },
        ],
        summary: "Correct audio analysis—contrast high vs low pitch effects.",
      },
    },
  },
};

export function deriveAssistantFromGameMeta(meta: GameMeta): AssistantGameIntegration {
  const fromLong = meta.longDescription.slice(0, 3).join(" ");
  const autoBrief = [meta.description, fromLong]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  let tutorBrief =
    meta.assistantTutorBrief?.trim() ||
    autoBrief ||
    `STEM learning activity: ${meta.title}.`;

  if (tutorBrief.length > MAX_TUTOR_BRIEF_CHARS) {
    tutorBrief = `${tutorBrief.slice(0, MAX_TUTOR_BRIEF_CHARS)}…`;
  }

  let mistakeGuide = meta.assistantMistakeGuide?.trim();
  if (mistakeGuide && mistakeGuide.length > MAX_MISTAKE_GUIDE_CHARS) {
    mistakeGuide = `${mistakeGuide.slice(0, MAX_MISTAKE_GUIDE_CHARS)}…`;
  }

  let dialogueConstraints = meta.assistantDialogueConstraints?.trim();
  if (dialogueConstraints && dialogueConstraints.length > MAX_DIALOGUE_CONSTRAINTS_CHARS) {
    dialogueConstraints = `${dialogueConstraints.slice(0, MAX_DIALOGUE_CONSTRAINTS_CHARS)}…`;
  }

  return {
    slug: meta.slug,
    title: meta.title,
    subject: `${meta.subject} — STEM / educational game`,
    tutorBrief,
    mistakeGuide: mistakeGuide || undefined,
    dialogueConstraints: dialogueConstraints || undefined,
    defaultTargetConcept:
      meta.assistantDefaultTargetConcept?.trim() ||
      meta.slug.replace(/-/g, "_"),
  };
}

function mergeIntegration(
  meta: GameMeta,
  override?: AssistantIntegrationOverride,
): AssistantGameIntegration {
  const base = deriveAssistantFromGameMeta(meta);
  if (!override) return base;

  return {
    ...base,
    title: override.title ?? base.title,
    subject: override.subject ?? base.subject,
    tutorBrief: override.tutorBrief ?? base.tutorBrief,
    mistakeGuide: override.mistakeGuide ?? base.mistakeGuide,
    dialogueConstraints: override.dialogueConstraints ?? base.dialogueConstraints,
    defaultTargetConcept:
      override.defaultTargetConcept ?? base.defaultTargetConcept,
    staticFallbacks: override.staticFallbacks ?? base.staticFallbacks,
  };
}

export function getAssistantGameIntegration(
  slug: string,
): AssistantGameIntegration | undefined {
  const meta = getGameBySlug(slug);
  if (!meta) return undefined;
  return mergeIntegration(meta, INTEGRATION_OVERRIDES[slug]);
}

export function listAssistantGameSlugs(): string[] {
  return games.map((g) => g.slug);
}
