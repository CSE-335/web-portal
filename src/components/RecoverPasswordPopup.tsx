"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Text,
  Group,
} from "@mantine/core";
import { resetPassword } from "@/lib/supabase/auth";

interface RecoverPasswordPopupProps {
  opened: boolean;
  onClose: () => void;
}

const inputWrapperStyle = {
  borderRadius: "24px",
  background: "var(--input-wrapper-bg, linear-gradient(#525b85, #525b85) padding-box, linear-gradient(to bottom, #7886bf, #6e91d0) border-box)",
  border: "var(--input-wrapper-border, 2px solid transparent)",
};

const sharedInputStyles = {
  wrapper: inputWrapperStyle,
  input: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "none",
    height: "46px",
    fontSize: "15px",
    fontFamily: "var(--font-alexandria), sans-serif",
    fontWeight: 400,
    paddingLeft: "20px",
  },
};

export default function RecoverPasswordPopup({ opened, onClose }: RecoverPasswordPopupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSent(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size={440}
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
          overflowX: "hidden",
          padding: "8px 48px 28px",
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
      title="Recover Password"
    >
      {sent ? (
        <Stack gap="md" align="center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: 16, color: "var(--text-primary)", textAlign: "center" }}>
            Check your email
          </Text>
          <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 400, fontSize: 14, color: "var(--text-secondary)", textAlign: "center" }}>
            We sent a password reset link to <strong style={{ color: "var(--text-muted)" }}>{email}</strong>. Click the link in the email to set a new password.
          </Text>
          <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
            Signed up with Google? You can still set a password, or just sign in with Google directly.
          </Text>
          <Button
            onClick={handleClose}
            style={{
              background: "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)",
              borderRadius: "20px",
              color: "#fbe6e6",
              fontFamily: "var(--font-alexandria), sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              height: "40px",
              width: "160px",
            }}
          >
            Done
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 400, fontSize: 14, color: "var(--text-secondary)", textAlign: "center" }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              styles={sharedInputStyles}
            />

            {error && (
              <Text c="red.4" fz="sm" style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
                {error}
              </Text>
            )}

            <Group justify="center">
              <Button
                type="submit"
                loading={isLoading}
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
                }}
              >
                Send Reset Link
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
