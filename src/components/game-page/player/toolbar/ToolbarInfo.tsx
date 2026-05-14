import Image from "next/image";
import { Group, Box, Title, Text } from "@mantine/core";

type ToolbarInfoProps = {
  title: string;
  subject: string;
  /** Single-row title/subject; no flex-grow — avoids huge toolbar chrome in mobile immersive + landscape. */
  compact?: boolean;
};

export default function ToolbarInfo({ title, subject, compact = false }: ToolbarInfoProps) {
  return (
    <Group
      gap={compact ? "xs" : "sm"}
      wrap="nowrap"
      align="center"
      style={{ minWidth: 0, flex: compact ? "0 1 min(58%, 280px)" : "1 1 auto" }}
    >
      <Image
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games logo"
        width={compact ? 34 : 42}
        height={compact ? 34 : 42}
        className={compact ? "h-auto w-8 shrink-0" : "h-auto w-9 shrink-0"}
      />
      <Box style={{ minWidth: 0 }}>
        <Title
          order={1}
          fz={compact ? "sm" : { base: "xl", md: "h3" }}
          c="white"
          lineClamp={compact ? 1 : undefined}
          style={compact ? undefined : { wordBreak: "break-word", hyphens: "auto" }}
        >
          {title}
        </Title>
        <Text
          fz={compact ? "xs" : "sm"}
          c="var(--toolbar-subject)"
          lineClamp={compact ? 1 : undefined}
          style={compact ? undefined : { wordBreak: "break-word" }}
        >
          {subject}
        </Text>
      </Box>
    </Group>
  );
}
