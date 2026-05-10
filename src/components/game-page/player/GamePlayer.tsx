"use client";

import { ActionIcon, Box, Paper } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { AssistantPanel } from "@/features/assistant";
import {
  addFullscreenChangeListener,
  GAME_IMMERSIVE_UI_BODY_CLASS,
  getFullscreenElement,
  MOBILE_IMMERSIVE_VIEWPORT_MQ,
  unlockScreenOrientation,
} from "@/lib/dom/fullscreen";
import SaveProgressBanner from "./SaveProgressBanner";
import GameEmbed from "./GameEmbed";
import GameToolbar from "./GameToolbar";
import MobileImmersiveHints from "./MobileImmersiveHints";
import { useCallback, useEffect, useRef, useState } from "react";

type GamePlayerProps = {
  title: string;
  subject: string;
  iframeSrc: string;
  /** Desktop / tablet iframe height (CSS length). */
  embedHeight?: string;
  /** Narrow viewports: shorter chrome budget so the iframe fits the usable screen. */
  embedHeightMobile?: string;
  slug: string;
};

export default function GamePlayer({
  title,
  subject,
  iframeSrc,
  embedHeight = "760px",
  embedHeightMobile,
  slug,
}: GamePlayerProps) {
  const embedRef = useRef<HTMLElement | null>(null);
  const isNarrow = useMediaQuery("(max-width: 47.99em)", true);
  /** Phone layouts in portrait or landscape (uses max-height so landscape-wide phones still match). */
  const useMobileImmersiveFs = useMediaQuery(MOBILE_IMMERSIVE_VIEWPORT_MQ, true);
  const iframeHeight = isNarrow ? (embedHeightMobile ?? embedHeight) : embedHeight;
  const [mobileImmersive, setMobileImmersive] = useState(false);

  const exitMobileImmersive = useCallback(() => {
    setMobileImmersive(false);
    unlockScreenOrientation();
  }, []);

  useEffect(() => {
    if (!mobileImmersive) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileImmersive]);

  useEffect(() => {
    return () => {
      unlockScreenOrientation();
    };
  }, []);

  useEffect(() => {
    const syncImmersiveChrome = () => {
      const immersed = !!getFullscreenElement() || mobileImmersive;
      document.body.classList.toggle(GAME_IMMERSIVE_UI_BODY_CLASS, immersed);
    };
    syncImmersiveChrome();
    const off = addFullscreenChangeListener(syncImmersiveChrome);
    return () => {
      off();
      document.body.classList.remove(GAME_IMMERSIVE_UI_BODY_CLASS);
    };
  }, [mobileImmersive]);

  return (
    <Paper
      ref={embedRef}
      component="section"
      data-game-fullscreen-root
      className={mobileImmersive ? "game-mobile-immersive-root" : undefined}
      style={{
        overflow: mobileImmersive ? "visible" : "hidden",
        borderRadius: mobileImmersive ? 0 : "clamp(16px, 3vw, 28px)",
        background: "var(--player-bg)",
        border: mobileImmersive ? "none" : "1px solid var(--player-border)",
        boxShadow: mobileImmersive ? "none" : "var(--shadow-card)",
        ...(mobileImmersive ? {} : { position: "relative" }),
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MobileImmersiveHints active={mobileImmersive} />
      {mobileImmersive ? (
        <ActionIcon
          type="button"
          size={48}
          radius="xl"
          variant="filled"
          color="dark"
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
          className="game-mobile-fs-exit"
          onClick={exitMobileImmersive}
          styles={{
            root: {
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
            },
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1, fontWeight: 600 }} aria-hidden>
            ×
          </span>
        </ActionIcon>
      ) : null}
      <Box p={{ base: 6, md: "xs" }} className="game-fullscreen-main">
        <Box
          className="game-fullscreen-media"
          style={{
            overflow: "hidden",
            borderRadius: "clamp(14px, 2.5vw, 20px)",
            background: "var(--player-embed-bg)",
          }}
        >
          <SaveProgressBanner />
          <GameEmbed
            src={iframeSrc}
            title={title}
            height={iframeHeight}
            slug={slug}
            rootClassName="game-fullscreen-iframe-inner"
          />
        </Box>
      </Box>

      <GameToolbar
        slug={slug}
        title={title}
        subject={subject}
        embedRef={embedRef}
        useMobileImmersiveFs={useMobileImmersiveFs}
        mobileImmersiveActive={mobileImmersive}
        onMobileImmersiveChange={setMobileImmersive}
      />
      <Box
        className="game-fullscreen-assistant-host"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <AssistantPanel />
      </Box>
    </Paper>
  );
}
