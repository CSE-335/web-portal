"use client";

import { useState, useEffect, RefObject } from "react";
import Image from "next/image";
import { Group, ActionIcon } from "@mantine/core";
import { toggleGameLike, isGameLikedByUser } from "@/lib/supabase/game-likes";
import { supabase } from "@/lib/supabase/client";
import { useAssistant } from "@/features/assistant";
import { unlockWebAudioPlayback } from "@/features/assistant/lib/unlockWebAudioPlayback";
import {
  addFullscreenChangeListener,
  exitFullscreenDocument,
  getFullscreenElement,
  lockLandscapePrimary,
  matchesMobileImmersiveViewport,
  requestFullscreenElement,
  unlockScreenOrientation,
} from "@/lib/dom/fullscreen";

type ToolbarButtonsProps = {
  slug: string;
  embedRef: RefObject<HTMLElement | null>;
  useMobileImmersiveFs?: boolean;
  mobileImmersiveActive?: boolean;
  onMobileImmersiveChange?: (next: boolean) => void;
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

export default function ToolbarButtons({
  slug,
  embedRef,
  useMobileImmersiveFs = false,
  mobileImmersiveActive = false,
  onMobileImmersiveChange,
}: ToolbarButtonsProps) {
  const [liked, setLiked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const { state, dispatch } = useAssistant();
  const isMuted = !state.voiceEnabled;

  useEffect(() => {
    const onChange = () => setNativeFullscreen(!!getFullscreenElement());
    return addFullscreenChangeListener(onChange);
  }, []);

  const isFullscreen =
    nativeFullscreen || (useMobileImmersiveFs && mobileImmersiveActive);

  const handleFullscreen = () => {
    if (useMobileImmersiveFs && onMobileImmersiveChange) {
      const next = !mobileImmersiveActive;
      onMobileImmersiveChange(next);
      if (next) {
        void lockLandscapePrimary();
      } else {
        unlockScreenOrientation();
      }
      return;
    }

    if (!getFullscreenElement()) {
      void (async () => {
        await requestFullscreenElement(embedRef.current);
        // iOS Safari often omits / no-ops element fullscreen — fall back to immersive overlay on narrow screens.
        if (
          !getFullscreenElement() &&
          onMobileImmersiveChange &&
          matchesMobileImmersiveViewport()
        ) {
          onMobileImmersiveChange(true);
          void lockLandscapePrimary();
        }
      })();
    } else {
      void exitFullscreenDocument();
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
        onClick={() => {
          if (!state.isOpen) {
            unlockWebAudioPlayback();
          }
          dispatch({ type: state.isOpen ? "CLOSE_PANEL" : "OPEN_PANEL" });
        }}
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
