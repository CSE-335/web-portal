import Image from "next/image";
import { Group, ActionIcon } from "@mantine/core";

type ToolbarButtonsProps = {
  iframeSrc: string;
};

const actionButtonStyle = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.1)",
};

function ToolbarAction({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ActionIcon
      variant="default"
      radius="xl"
      size="lg"
      aria-label={label}
      style={actionButtonStyle}
    >
      {children}
    </ActionIcon>
  );
}

export default function ToolbarButtons({ iframeSrc }: ToolbarButtonsProps) {
  return (
    <Group gap="xs" wrap="wrap">
      <ToolbarAction label="Favorite game">
        <Image src="/images/like2.svg" alt="" width={20} height={20} aria-hidden />
      </ToolbarAction>
      <ToolbarAction label="AI Assistant">
        <Image src="/images/aichat.svg" alt="" width={28} height={28} aria-hidden />
      </ToolbarAction>
      <ToolbarAction label="Mute">
        <Image src="/images/mute.svg" alt="" width={22} height={22} aria-hidden />
      </ToolbarAction>
      <ActionIcon
        component="a"
        href={iframeSrc}
        target="_blank"
        rel="noopener noreferrer"
        variant="default"
        radius="xl"
        size="lg"
        aria-label="Open in fullscreen tab"
        style={actionButtonStyle}
      >
        <Image src="/images/full.svg" alt="" width={17} height={17} aria-hidden />
      </ActionIcon>
    </Group>
  );
}
