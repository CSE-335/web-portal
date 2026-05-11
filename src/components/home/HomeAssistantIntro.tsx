"use client";

import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal, Stack, Text, Title, Button, Group, Box, SimpleGrid } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { DEFAULT_CONFIG } from "@/features/assistant/config";

const STORAGE_KEY = "stemgames_home_assistant_intro_v1";

const toolbarBtn = {
  background: "var(--toolbar-btn-bg)",
  border: "1px solid var(--toolbar-btn-border)",
} as const;

function MascotPeek({
  src,
  alt,
  accent,
  fallbackSrc,
  compact,
}: {
  src: string;
  alt: string;
  accent: string;
  fallbackSrc: string;
  compact: boolean;
}) {
  const onImgError = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget;
      if (el.dataset.fallback === "1") return;
      el.dataset.fallback = "1";
      el.src = fallbackSrc;
    },
    [fallbackSrc],
  );

  const s = compact ? 56 : 72;

  return (
    <Box
      style={{
        width: s,
        height: s,
        minWidth: s,
        minHeight: s,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 14px ${accent}55`,
        background: "rgba(0,0,0,0.2)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={onImgError}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Box>
  );
}

function FakeToolbarButton({
  children,
  highlight,
  largeTouchTarget,
}: {
  children: React.ReactNode;
  highlight?: boolean;
  largeTouchTarget?: boolean;
}) {
  const wh = largeTouchTarget ? "48px" : "44px";

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full select-none"
      style={{
        width: wh,
        height: wh,
        minWidth: wh,
        minHeight: wh,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        ...toolbarBtn,
        ...(highlight
          ? {
              background: "rgba(27, 65, 255, 0.35)",
              border: "1px solid rgba(27, 65, 255, 0.65)",
              boxShadow: "0 0 0 2px rgba(27, 65, 255, 0.25)",
            }
          : {}),
      }}
    >
      {children}
    </span>
  );
}

export default function HomeAssistantIntro() {
  const t = useTranslations("home");
  const [opened, setOpened] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  /** Phones, small tablets, and short landscape — fullscreen + padded safe areas + scroll body */
  const isMobileAssistantIntro = useMediaQuery(
    "(max-width: 47.99em), (max-height: 38rem), ((max-height: 48rem) and (orientation: landscape))",
    true,
  );

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setOpened(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || process.env.NODE_ENV === "test") return;
    let cancelled = false;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      if (!cancelled) setOpened(true);
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hydrated]);

  const { mascotAssetPath, mascotAssetExtension } = DEFAULT_CONFIG;
  const laurieSrc = `${mascotAssetPath}/laurie/idle.${mascotAssetExtension}`;
  const livvySrc = `${mascotAssetPath}/livvy/idle.${mascotAssetExtension}`;

  const safePad = {
    paddingTop: "max(12px, env(safe-area-inset-top, 0px))",
    paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
    paddingLeft: "max(12px, env(safe-area-inset-left, 0px))",
    paddingRight: "max(12px, env(safe-area-inset-right, 0px))",
  };

  const largeToolbarDemo = Boolean(isMobileAssistantIntro);

  return (
    <Modal
      opened={opened}
      onClose={dismiss}
      centered={!isMobileAssistantIntro}
      fullScreen={isMobileAssistantIntro}
      size={isMobileAssistantIntro ? undefined : "lg"}
      radius={isMobileAssistantIntro ? 0 : "md"}
      padding={isMobileAssistantIntro ? "sm" : "lg"}
      overlayProps={{ opacity: 0.55, blur: 4 }}
      transitionProps={{ duration: isMobileAssistantIntro ? 220 : 200 }}
      trapFocus={opened}
      withinPortal={true}
      lockScroll={isMobileAssistantIntro}
      aria-labelledby="home-assistant-intro-title"
      aria-describedby="home-assistant-intro-desc"
      title={
        <Title
          component="span"
          id="home-assistant-intro-title"
          order={isMobileAssistantIntro ? 3 : 4}
          size={isMobileAssistantIntro ? "h5" : "h4"}
          style={{ color: "var(--text-primary)", lineHeight: 1.35, hyphens: "auto" }}
        >
          {t("assistantIntro.modalTitle")}
        </Title>
      }
      styles={{
        content: {
          backgroundColor: "var(--surface-primary)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-card)",
          ...(isMobileAssistantIntro
            ? {
                ...safePad,
                maxHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
              }
            : {}),
        },
        header: {
          backgroundColor: "var(--surface-primary)",
          flexShrink: 0,
          ...(isMobileAssistantIntro ? { alignItems: "flex-start", paddingBottom: 4 } : {}),
        },
        body: {
          paddingTop: 4,
          ...(isMobileAssistantIntro
            ? {
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overscrollBehaviorY: "contain",
                WebkitOverflowScrolling: "touch",
              }
            : {}),
        },
      }}
    >
      <Stack gap={isMobileAssistantIntro ? "sm" : "md"} id="home-assistant-intro-desc">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <MascotPeek
              src={laurieSrc}
              alt="Laurie"
              accent="#60A5FA"
              fallbackSrc="/images/aichat.svg"
              compact={Boolean(isMobileAssistantIntro)}
            />
            <Text
              size="sm"
              style={{
                color: "var(--text-body)",
                lineHeight: isMobileAssistantIntro ? 1.6 : 1.55,
                fontSize: isMobileAssistantIntro ? "clamp(13px, 3.9vw, 15px)" : undefined,
              }}
              className="min-w-0"
            >
              {t("assistantIntro.laurieIntro")}
            </Text>
          </Group>
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <MascotPeek
              src={livvySrc}
              alt="Livvy"
              accent="#F472B6"
              fallbackSrc="/images/aichat.svg"
              compact={Boolean(isMobileAssistantIntro)}
            />
            <Text
              size="sm"
              style={{
                color: "var(--text-body)",
                lineHeight: isMobileAssistantIntro ? 1.6 : 1.55,
                fontSize: isMobileAssistantIntro ? "clamp(13px, 3.9vw, 15px)" : undefined,
              }}
              className="min-w-0"
            >
              {t("assistantIntro.livvyIntro")}
            </Text>
          </Group>
        </SimpleGrid>

        <Box
          p={isMobileAssistantIntro ? "sm" : "md"}
          style={{
            borderRadius: 12,
            border: "1px solid var(--card-border)",
            background: "rgba(0,0,0,0.12)",
            touchAction: "manipulation",
          }}
        >
          <Text
            size="xs"
            fw={600}
            mb="xs"
            tt="uppercase"
            style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}
          >
            {t("assistantIntro.iconCaption")}
          </Text>
          <Box
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
              scrollbarWidth: "thin",
              marginInline: isMobileAssistantIntro ? -6 : undefined,
              paddingInline: isMobileAssistantIntro ? 6 : undefined,
              touchAction: "pan-x manipulation",
              paddingBottom: 4,
            }}
          >
            <Group justify="center" gap="xs" wrap="nowrap" pb={2} style={{ minWidth: "min-content" }}>
              <FakeToolbarButton largeTouchTarget={largeToolbarDemo}>
                <Image src="/images/like2.svg" alt="" width={20} height={20} aria-hidden className="pointer-events-none select-none" />
              </FakeToolbarButton>
              <FakeToolbarButton highlight largeTouchTarget={largeToolbarDemo}>
                <Image src="/images/aichat.svg" alt="" width={28} height={28} aria-hidden className="pointer-events-none select-none" />
              </FakeToolbarButton>
              <FakeToolbarButton largeTouchTarget={largeToolbarDemo}>
                <Image src="/images/unmute.svg" alt="" width={22} height={22} aria-hidden className="pointer-events-none select-none" />
              </FakeToolbarButton>
              <FakeToolbarButton largeTouchTarget={largeToolbarDemo}>
                <Image src="/images/full.svg" alt="" width={17} height={17} aria-hidden className="pointer-events-none select-none" />
              </FakeToolbarButton>
            </Group>
          </Box>
          <Text
            size="sm"
            mt="sm"
            style={{
              color: "var(--text-body)",
              lineHeight: 1.5,
              ...(isMobileAssistantIntro ? { textAlign: "left" } : { textAlign: "center" }),
            }}
          >
            {t("assistantIntro.toolbarHint")}
          </Text>
        </Box>

        {isMobileAssistantIntro ? (
          <Stack gap="sm" pb="calc(8px + env(safe-area-inset-bottom, 0px))">
            <Button
              variant="default"
              fullWidth
              size="md"
              onClick={dismiss}
              styles={{
                root: {
                  minHeight: 48,
                  touchAction: "manipulation",
                },
              }}
            >
              {t("assistantIntro.gotIt")}
            </Button>
            <Button
              component={Link}
              href="/tutorial"
              onClick={dismiss}
              variant="light"
              fullWidth
              size="md"
              styles={{
                root: {
                  minHeight: 48,
                  touchAction: "manipulation",
                },
              }}
            >
              {t("assistantIntro.seeTutorial")}
            </Button>
          </Stack>
        ) : (
          <Group justify="space-between" gap="sm" wrap="wrap" grow>
            <Button variant="default" onClick={dismiss} style={{ flex: "1 1 140px" }}>
              {t("assistantIntro.gotIt")}
            </Button>
            <Button component={Link} href="/tutorial" onClick={dismiss} variant="light" style={{ flex: "1 1 180px" }}>
              {t("assistantIntro.seeTutorial")}
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}
