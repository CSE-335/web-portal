"use client";

import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal, Stack, Text, Title, Button, Group, Box, SimpleGrid } from "@mantine/core";
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
}: {
  src: string;
  alt: string;
  accent: string;
  fallbackSrc: string;
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

  return (
    <Box
      style={{
        width: 72,
        height: 72,
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
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className="inline-flex h-11 w-11 items-center justify-center rounded-full sm:h-11 sm:w-11"
      style={{
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

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setOpened(false);
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || process.env.NODE_ENV === "test") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    timer = setTimeout(() => {
      if (!cancelled) setOpened(true);
    }, 700);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [hydrated]);

  const { mascotAssetPath, mascotAssetExtension } = DEFAULT_CONFIG;
  const laurieSrc = `${mascotAssetPath}/laurie/idle.${mascotAssetExtension}`;
  const livvySrc = `${mascotAssetPath}/livvy/idle.${mascotAssetExtension}`;

  return (
    <Modal
      opened={opened}
      onClose={dismiss}
      centered
      size="lg"
      radius="md"
      padding="lg"
      overlayProps={{ opacity: 0.55, blur: 4 }}
      aria-labelledby="home-assistant-intro-title"
      aria-describedby="home-assistant-intro-desc"
      title={
        <Title
          component="span"
          id="home-assistant-intro-title"
          size="h4"
          style={{ color: "var(--text-primary)", lineHeight: 1.3 }}
        >
          {t("assistantIntro.modalTitle")}
        </Title>
      }
      styles={{
        content: {
          backgroundColor: "var(--surface-primary)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-card)",
        },
        header: {
          backgroundColor: "var(--surface-primary)",
        },
        body: {
          paddingTop: 4,
        },
      }}
    >
      <Stack gap="md" id="home-assistant-intro-desc">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <MascotPeek src={laurieSrc} alt="Laurie" accent="#60A5FA" fallbackSrc="/images/aichat.svg" />
            <Text size="sm" style={{ color: "var(--text-body)", lineHeight: 1.55 }} className="min-w-0">
              {t("assistantIntro.laurieIntro")}
            </Text>
          </Group>
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <MascotPeek src={livvySrc} alt="Livvy" accent="#F472B6" fallbackSrc="/images/aichat.svg" />
            <Text size="sm" style={{ color: "var(--text-body)", lineHeight: 1.55 }} className="min-w-0">
              {t("assistantIntro.livvyIntro")}
            </Text>
          </Group>
        </SimpleGrid>

        <Box
          p="md"
          style={{
            borderRadius: 12,
            border: "1px solid var(--card-border)",
            background: "rgba(0,0,0,0.12)",
          }}
        >
          <Text size="xs" fw={600} mb="xs" tt="uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
            {t("assistantIntro.iconCaption")}
          </Text>
          <Group justify="center" gap="xs" wrap="nowrap">
            <FakeToolbarButton>
              <Image src="/images/like2.svg" alt="" width={20} height={20} aria-hidden className="pointer-events-none select-none" />
            </FakeToolbarButton>
            <FakeToolbarButton highlight>
              <Image src="/images/aichat.svg" alt="" width={28} height={28} aria-hidden className="pointer-events-none select-none" />
            </FakeToolbarButton>
            <FakeToolbarButton>
              <Image src="/images/unmute.svg" alt="" width={22} height={22} aria-hidden className="pointer-events-none select-none" />
            </FakeToolbarButton>
            <FakeToolbarButton>
              <Image src="/images/full.svg" alt="" width={17} height={17} aria-hidden className="pointer-events-none select-none" />
            </FakeToolbarButton>
          </Group>
          <Text size="sm" mt="sm" style={{ color: "var(--text-body)", lineHeight: 1.5 }} ta="center">
            {t("assistantIntro.toolbarHint")}
          </Text>
        </Box>

        <Group justify="space-between" gap="sm" wrap="wrap" grow>
          <Button variant="default" onClick={dismiss} style={{ flex: "1 1 140px" }}>
            {t("assistantIntro.gotIt")}
          </Button>
          <Button
            component={Link}
            href="/tutorial"
            onClick={dismiss}
            variant="light"
            style={{ flex: "1 1 180px" }}
          >
            {t("assistantIntro.seeTutorial")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
