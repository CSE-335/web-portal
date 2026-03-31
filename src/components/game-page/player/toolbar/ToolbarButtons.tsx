"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Group, ActionIcon } from "@mantine/core";
import { toggleGameLike, isGameLikedByUser } from "@/lib/supabase/game-likes";
import { supabase } from "@/lib/supabase/client";

type ToolbarButtonsProps = {
  slug: string;
  iframeSrc: string;
};

const actionButtonStyle = {
  background: "var(--toolbar-btn-bg)",
  border: "1px solid var(--toolbar-btn-border)",
};

function ToolbarAction({
  label,
  children,
  onClick,
  style,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <ActionIcon
      variant="default"
      radius="xl"
      size="lg"
      aria-label={label}
      style={{ ...actionButtonStyle, ...style }}
      onClick={onClick}
    >
      {children}
    </ActionIcon>
  );
}

export default function ToolbarButtons({ slug, iframeSrc }: ToolbarButtonsProps) {
  const [liked, setLiked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsAuthenticated(true);
        isGameLikedByUser(slug).then(setLiked);
      }
    });
  }, [slug]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) return;
    const result = await toggleGameLike(slug);
    if (!result.error) {
      setLiked(result.liked);
    }
  };

  return (
    <Group gap="xs" wrap="wrap">
      <ToolbarAction
        label={liked ? "Unlike game" : "Favorite game"}
        onClick={handleLikeToggle}
        style={liked ? { background: "rgba(27, 65, 255, 0.4)", border: "1px solid rgba(27, 65, 255, 0.6)" } : undefined}
      >
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
