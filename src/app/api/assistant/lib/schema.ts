import { z } from "zod";

export const DialogueLineSchema = z.object({
  speaker: z.enum(["Laurie", "Livvy"]),
  text: z.string(),
  emotion: z.enum([
    "idle",
    "speaking",
    "happy",
    "confused",
    "surprised",
    "thinking",
    "encouraging",
  ]),
});

export const AssistantResponseSchema = z.object({
  lines: z.array(DialogueLineSchema).min(1),
  summary: z.string(),
});
