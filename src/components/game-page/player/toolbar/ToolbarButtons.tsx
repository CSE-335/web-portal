"use client";

import { useState, useEffect, RefObject } from "react";
import Image from "next/image";
import { Group, ActionIcon } from "@mantine/core";
import { toggleGameLike, isGameLikedByUser } from "@/lib/supabase/game-likes";
import { supabase } from "@/lib/supabase/client";
import { useAssistant } from "@/features/assistant";

type ToolbarButtonsProps = {
  slug: string;
  embedRef: RefObject<HTMLDivElement | null>;
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
      size={44}
      aria-label={label}
      title={label}
      style={{ ...actionButtonStyle, ...style }}
      onClick={onClick}
    >
      {children}
    </ActionIcon>
  );
}

export default function ToolbarButtons({ slug, embedRef }: ToolbarButtonsProps) {
  const [liked, setLiked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state, dispatch } = useAssistant();
  const isMuted = !state.voiceEnabled;

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      embedRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

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
      <ToolbarAction
        label={state.isOpen ? "Hide tutors" : "Ask AI tutors"}
        onClick={() => dispatch({ type: state.isOpen ? "CLOSE_PANEL" : "OPEN_PANEL" })}
        style={state.isOpen ? { background: "rgba(27, 65, 255, 0.4)", border: "1px solid rgba(27, 65, 255, 0.6)" } : undefined}
      >
        <Image src="/images/aichat.svg" alt="" width={28} height={28} aria-hidden />
      </ToolbarAction>
      <ToolbarAction
        label={isMuted ? "Unmute" : "Mute"}
        onClick={() => dispatch({ type: "TOGGLE_VOICE" })}
        style={isMuted ? { background: "rgba(27, 65, 255, 0.4)", border: "1px solid rgba(27, 65, 255, 0.6)" } : undefined}
      >
        <Image src={isMuted ? "/images/mute.svg" : "/images/unmute.svg"} alt="" width={22} height={22} aria-hidden />
      </ToolbarAction>
      <ToolbarAction
        label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        onClick={handleFullscreen}
        style={isFullscreen ? { background: "rgba(27, 65, 255, 0.4)", border: "1px solid rgba(27, 65, 255, 0.6)" } : undefined}
      >
        <Image src="/images/full.svg" alt="" width={17} height={17} aria-hidden />
      </ToolbarAction>
    </Group>
  );
}
