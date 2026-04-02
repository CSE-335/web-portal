// ============================================================================
// Freeform text input for students to type questions to Laurie & Livvy.
// Includes client-side rate limiting, input sanitization, and max length.
// ============================================================================

"use client";

import { useState, useRef, useCallback } from "react";
import { Box, Textarea, ActionIcon, Text, Loader, Group } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import { SendIcon } from "./icons";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MS = 3000;

function sanitizeInput(raw: string): string {
  let text = raw.trim().slice(0, MAX_MESSAGE_LENGTH);

  const injectionPatterns = [
    /\bsystem\s*:/i,
    /\bignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
    /\byou\s+are\s+now\b/i,
    /\bact\s+as\b/i,
    /\bpretend\s+(to\s+be|you('?re|r))\b/i,
    /\bforget\s+(everything|all|your)\b/i,
    /\bnew\s+instructions?\b/i,
    /```[\s\S]*```/,
  ];

  for (const pattern of injectionPatterns) {
    text = text.replace(pattern, "[filtered]");
  }

  return text;
}

export default function ChatInput() {
  const { state, sendUserMessage } = useAssistant();
  const [value, setValue] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = state.isGenerating || cooldown;

  const handleSubmit = useCallback(() => {
    const cleaned = sanitizeInput(value);
    if (!cleaned || isDisabled) return;

    sendUserMessage(cleaned);
    setValue("");

    setCooldown(true);
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false);
    }, RATE_LIMIT_MS);
  }, [value, isDisabled, sendUserMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const charsLeft = MAX_MESSAGE_LENGTH - value.length;

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: 680,
        margin: "8px auto 0",
      }}
    >
      <Box
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          background: "var(--surface-primary)",
          border: "1px solid var(--overlay-border)",
          borderRadius: 10,
          padding: "8px 10px",
          backdropFilter: "blur(16px)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Textarea
          className="tutor-chat-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={
            cooldown
              ? "Wait a moment..."
              : state.isGenerating
                ? "The twins are responding..."
                : "Ask Laurie & Livvy a question..."
          }
          disabled={isDisabled}
          autosize
          minRows={1}
          maxRows={3}
          styles={{
            root: { flex: 1 },
            input: {
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--text-primary)",
              fontSize: 14,
              borderRadius: 8,
              "&::placeholder": { color: "rgba(160, 200, 255, 0.6)" },
              "&:focus": { borderColor: "rgba(96,165,250,0.5)" },
              "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
            },
          }}
        />

        <ActionIcon
          variant="filled"
          size="lg"
          radius="md"
          onClick={handleSubmit}
          disabled={isDisabled || !value.trim()}
          aria-label="Send message"
          style={{
            flexShrink: 0,
            background: isDisabled || !value.trim()
              ? "rgba(100,100,140,0.3)"
              : "linear-gradient(135deg, #2B5FFF 0%, #1B41FF 40%, #0054F0 100%)",
            border: "none",
          }}
        >
          {state.isGenerating ? (
            <Loader size={14} color="white" />
          ) : (
            <SendIcon size={16} />
          )}
        </ActionIcon>
      </Box>

      <Group justify="space-between" px={4} mt={2}>
        <Text size="10px" style={{ color: "rgba(160, 200, 255, 0.5)" }}>
          Enter to send &middot; Shift+Enter for newline
        </Text>
        {value.length > 0 && (
          <Text
            size="10px"
            c={charsLeft < 50 ? "red" : "dimmed"}
            style={{ opacity: charsLeft < 50 ? 0.8 : 0.4 }}
          >
            {charsLeft}
          </Text>
        )}
      </Group>
    </Box>
  );
}
