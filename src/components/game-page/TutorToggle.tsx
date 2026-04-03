"use client";

// Invisible bridge — listens for postMessage events from the game iframe
// The AI button in the toolbar handles open/close (ToolbarButtons.tsx)
import { GameIframeBridge } from "@/features/assistant";

interface TutorToggleProps {
  gameSlug: string;
}

export default function TutorToggle({ gameSlug }: TutorToggleProps) {
  return <GameIframeBridge gameFilter={gameSlug} />;
}
