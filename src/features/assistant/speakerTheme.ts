import type { Speaker } from "./types";

export interface SpeakerTheme {
  accent: string;
  glow: string;
  border: string;
  nameColor: string;
  displayName: string;
}

export const SPEAKER_THEME: Record<Speaker, SpeakerTheme> = {
  Laurie: {
    accent: "#60A5FA",
    glow: "rgba(96,165,250,0.4)",
    border: "rgba(96,165,250,0.25)",
    nameColor: "#93C5FD",
    displayName: "Laurie-chan",
  },
  Livvy: {
    accent: "#F472B6",
    glow: "rgba(244,114,182,0.4)",
    border: "rgba(244,114,182,0.2)",
    nameColor: "#F9A8D4",
    displayName: "Livvy-chan",
  },
  You: {
    accent: "#34D399",
    glow: "rgba(52,211,153,0.4)",
    border: "rgba(52,211,153,0.2)",
    nameColor: "#6EE7B7",
    displayName: "You",
  },
};
