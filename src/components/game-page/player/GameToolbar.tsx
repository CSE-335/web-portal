import { type RefObject } from "react";
import Link from "next/link";
import { Button, Flex, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import ToolbarInfo from "./toolbar/ToolbarInfo";
import ToolbarButtons from "./toolbar/ToolbarButtons";

type GameToolbarProps = {
  slug: string;
  title: string;
  subject: string;
  embedRef: RefObject<HTMLElement | null>;
  /** Narrow layouts: use fixed viewport “immersive” mode instead of the Fullscreen API (often unsupported on mobile Safari). */
  useMobileImmersiveFs?: boolean;
  mobileImmersiveActive?: boolean;
  onMobileImmersiveChange?: (next: boolean) => void;
};

export default function GameToolbar({
  slug,
  title,
  subject,
  embedRef,
  useMobileImmersiveFs = false,
  mobileImmersiveActive = false,
  onMobileImmersiveChange,
}: GameToolbarProps) {
  const t = useTranslations("common");
  const returnLabel = t("returnToMain");
  /** Align secondary row justification with Mantine `md` (same as toolbar column → row breakpoint). */
  /** `false` before mount — avoids assuming desktop toolbar layout on SSR / hydration. */
  const isMdUp = useMediaQuery("(min-width: 62em)", false);

  const immersive = !!mobileImmersiveActive;
  const mobileStacked = !immersive && !isMdUp;

  return (
    <Flex
      className="game-fullscreen-toolbar"
      direction={immersive ? "row" : { base: "column", md: "row" }}
      align="center"
      justify={immersive ? "space-between" : { md: "space-between" }}
      gap={immersive ? "xs" : "sm"}
      px={immersive ? "sm" : "md"}
      py={immersive ? "xs" : "sm"}
      wrap={immersive ? "wrap" : undefined}
      style={{
        borderTop: "1px solid var(--toolbar-border)",
        background: "var(--toolbar-bg)",
        ...(immersive ? { minHeight: 0, maxWidth: "100%" } : {}),
      }}
    >
      <ToolbarInfo title={title} subject={subject} compact={immersive} />
      {mobileStacked ? (
        <>
          <Button
            component={Link}
            href="/"
            variant="default"
            radius="xl"
            size="sm"
            title={returnLabel}
            flex="0 0 auto"
            w="100%"
            styles={{
              root: {
                background: "var(--toolbar-btn-bg)",
                border: "1px solid var(--toolbar-btn-border)",
                color: "white",
              },
            }}
          >
            {returnLabel}
          </Button>
          <Group
            gap="xs"
            wrap="wrap"
            justify="center"
            flex="0 0 auto"
            w="100%"
            style={{ flexShrink: 0 }}
          >
            <ToolbarButtons
              slug={slug}
              embedRef={embedRef}
              useMobileImmersiveFs={useMobileImmersiveFs}
              mobileImmersiveActive={mobileImmersiveActive}
              onMobileImmersiveChange={onMobileImmersiveChange}
            />
          </Group>
        </>
      ) : (
        <Group
          gap="xs"
          wrap="wrap"
          justify={immersive ? "flex-end" : "flex-end"}
          flex="0 0 auto"
          w="auto"
          style={{ flexShrink: 0 }}
        >
          <Button
            component={Link}
            href="/"
            variant="default"
            radius="xl"
            size="sm"
            title={returnLabel}
            styles={{
              root: {
                background: "var(--toolbar-btn-bg)",
                border: "1px solid var(--toolbar-btn-border)",
                color: "white",
              },
            }}
          >
            {returnLabel}
          </Button>
          <ToolbarButtons
            slug={slug}
            embedRef={embedRef}
            useMobileImmersiveFs={useMobileImmersiveFs}
            mobileImmersiveActive={mobileImmersiveActive}
            onMobileImmersiveChange={onMobileImmersiveChange}
          />
        </Group>
      )}
    </Flex>
  );
}
