"use client";

// Wraps all game pages with the AI tutor provider (panel renders inside GamePlayer fullscreen subtree)
import { AssistantProvider } from "@/features/assistant";
import GameRouteTouchIsolation from "@/components/game-page/GameRouteTouchIsolation";

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider>
      <GameRouteTouchIsolation>{children}</GameRouteTouchIsolation>
    </AssistantProvider>
  );
}
