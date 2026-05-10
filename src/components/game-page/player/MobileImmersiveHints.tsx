"use client";

import { Alert, Button, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { isStandaloneDisplayMode } from "@/lib/dom/fullscreen";

function isLikelyIOSWebKit(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

type MobileImmersiveHintsProps = {
  active: boolean;
};

/**
 * During mobile immersive play: suggests rotating in portrait; on iOS Safari, reminds users they can Add to Home Screen.
 */
export default function MobileImmersiveHints({ active }: MobileImmersiveHintsProps) {
  const t = useTranslations("common");
  const [dismissed, setDismissed] = useState(false);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    if (!active) {
      setDismissed(false);
      return;
    }
    const mq = window.matchMedia("(orientation: portrait)");
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [active]);

  if (!active || dismissed) return null;

  const standalone = isStandaloneDisplayMode();
  const showRotate = portrait;
  const showHomeTip = !standalone && isLikelyIOSWebKit();

  if (!showRotate && !showHomeTip) return null;

  return (
    <Alert variant="light" color="blue" radius="md" className="game-mobile-immersive-hint">
      <Stack gap="sm">
        {showRotate ? <Text size="sm">{t("rotateLandscapeHint")}</Text> : null}
        {showHomeTip ? (
          <Text size="xs" c="dimmed">
            {t("addToHomeShortTip")}
          </Text>
        ) : null}
        <Button size="xs" variant="light" onClick={() => setDismissed(true)}>
          {t("immersiveHintDismiss")}
        </Button>
      </Stack>
    </Alert>
  );
}
