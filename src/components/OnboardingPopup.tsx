"use client";

import {
  Modal,
  Stack,
  Text,
  Button,
} from "@mantine/core";

interface OnboardingPopupProps {
  opened: boolean;
  onClose: () => void;
}

export default function OnboardingPopup({ opened, onClose }: OnboardingPopupProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={480}
      styles={{
        content: {
          backgroundColor: "var(--surface-primary)",
          border: "none",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "var(--modal-shadow)",
        },
        header: {
          backgroundColor: "var(--surface-primary)",
          paddingBottom: 0,
          paddingTop: "8px",
          alignItems: "center",
        },
        body: {
          padding: "8px 48px 32px",
        },
        title: {
          color: "var(--text-primary)",
          fontSize: "22px",
          fontWeight: 500,
          fontFamily: "var(--font-alexandria), sans-serif",
          width: "100%",
          textAlign: "center",
        },
        close: {
          color: "var(--text-primary)",
        },
      }}
      title="Welcome to LLNL STEM Games!"
    >
      <Stack gap="md" align="center">
        <Text
          style={{
            color: "var(--text-body)",
            fontSize: "15px",
            fontFamily: "var(--font-alexandria), sans-serif",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          You&apos;re all set! Explore our collection of STEM games designed to make
          learning science, technology, engineering, and mathematics fun and interactive.
        </Text>

        <Text
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            fontFamily: "var(--font-alexandria), sans-serif",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Track your progress, earn achievements, and compete with other players.
          Pick a game below to get started!
        </Text>

        <Button
          onClick={onClose}
          w={200}
          h={40}
          style={{
            background: "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)",
            borderRadius: "20px",
            color: "#fbe6e6",
            fontFamily: "var(--font-alexandria), sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            border: "none",
            marginTop: "8px",
          }}
        >
          Let&apos;s Go!
        </Button>
      </Stack>
    </Modal>
  );
}
