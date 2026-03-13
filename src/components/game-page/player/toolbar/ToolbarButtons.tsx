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
      <ToolbarAction label="Favorite game">♡</ToolbarAction>
      <ToolbarAction label="Notes">🗒</ToolbarAction>
      <ToolbarAction label="Mute">🔇</ToolbarAction>
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
        ⛶
      </ActionIcon>
    </Group>
  );
}
