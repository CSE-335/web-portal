"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal, Stack, Slider, Button, Group, Text } from "@mantine/core";
import Cropper, { type Area } from "react-easy-crop";
import { useTranslations } from "next-intl";

type BannerCropModalProps = {
  opened: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (file: File) => Promise<boolean>;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Image load failed")));
    img.src = src;
  });
}

async function getCroppedBannerBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = 1500;
  canvas.height = 330;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      0.92
    );
  });
}

export default function BannerCropModal({ opened, imageSrc, onClose, onSave }: BannerCropModalProps) {
  const t = useTranslations("profile");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (opened && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setLocalError(null);
    }
  }, [opened, imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    setLocalError(null);
    try {
      const blob = await getCroppedBannerBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
      const ok = await onSave(file);
      if (ok) onClose();
    } catch {
      setLocalError(t("avatarCropEncodeFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened && !!imageSrc}
      onClose={() => { if (!saving) onClose(); }}
      title={t("changeBanner")}
      centered
      size="lg"
      styles={{
        content: { backgroundColor: "var(--surface-primary)" },
        header: { backgroundColor: "var(--surface-primary)" },
        title: {
          color: "var(--text-primary)",
          fontFamily: "var(--font-alexandria), sans-serif",
          fontWeight: 600,
        },
        body: { backgroundColor: "var(--surface-primary)" },
      }}
    >
      {imageSrc && (
        <Stack gap="md">
          <Text size="sm" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-alexandria), sans-serif" }}>
            {t("avatarCropHint")}
          </Text>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 300,
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--surface-secondary)",
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1100 / 240}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div>
            <Text size="xs" mb={6} style={{ color: "var(--text-secondary)", fontFamily: "var(--font-alexandria), sans-serif" }}>
              {t("avatarCropZoom")}
            </Text>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={setZoom}
              color="#1b41ff"
              disabled={saving}
              styles={{ track: { height: 6 } }}
            />
          </div>

          {localError && (
            <Text size="sm" c="red">
              {localError}
            </Text>
          )}

          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={onClose} disabled={saving} style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
              {t("avatarCropCancel")}
            </Button>
            <Button
              loading={saving}
              disabled={!croppedAreaPixels}
              onClick={() => void handleApply()}
              style={{
                background: "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)",
                fontFamily: "var(--font-alexandria), sans-serif",
              }}
            >
              {t("avatarCropApply")}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
