"use client";

// Wraps all game pages with the AI tutor provider and panel
import { AssistantProvider, AssistantPanel } from "@/features/assistant";

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider>
      {children}
      <AssistantPanel />
    </AssistantProvider>
  );
}
