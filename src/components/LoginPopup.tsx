"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Divider,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import SignupPopup from "./SignupPopup";
import RecoverPasswordPopup from "./RecoverPasswordPopup";
import { signInUser, signInWithGoogle } from "@/lib/supabase/auth";

interface LoginPopupProps {
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

export default function LoginPopup({ opened, onClose }: LoginPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signupModalOpened, setSignupModalOpened] = useState(false);
  const [recoverModalOpened, setRecoverModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('login');

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : t('invalidEmail'),
      password: (value) =>
        value.length >= 6 ? null : t('passwordShort'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInUser(values.email, values.password);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError);
    }
  };

  return (
    <>
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
            overflowX: "hidden",
            padding: "8px 48px 24px",
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
        title={t('title')}
      >
        <Stack gap="sm">
          <form id="login-form" onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                placeholder={t('email')}
                {...form.getInputProps("email")}
                required
                styles={sharedInputStyles}
              />

              <PasswordInput
                placeholder={t('password')}
                {...form.getInputProps("password")}
                required
                styles={{
                  ...sharedInputStyles,
                  innerInput: {
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                    border: "none",
                    height: "42px",
                    fontSize: "15px",
                    fontFamily: "var(--font-alexandria), sans-serif",
                    fontWeight: 400,
                    paddingLeft: "20px",
                  },
                  visibilityToggle: {
                    color: "var(--text-primary)",
                    marginRight: "12px",
                    width: "36px",
                    height: "36px",
                    "& svg": {
                      width: "30px",
                      height: "30px",
                    },
                  },
                }}
              />

              {error && (
                <Text c="red.4" fz="sm">
                  {error}
                </Text>
              )}

              <Group justify="flex-start" gap={40} wrap="nowrap">
                <Stack gap={0}>
                  <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--text-primary)" }}>
                    {t('noAccount')}
                  </Text>
                  <Text
                    component="span"
                    style={{ color: "#2a7fff", cursor: "pointer", fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: "15px" }}
                    onClick={() => { onClose(); setSignupModalOpened(true); }}
                  >
                    {t('registerHere')}
                  </Text>
                </Stack>
                <Stack gap={0} align="flex-start">
                  <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--text-primary)" }}>
                    {t('forgotPassword')}
                  </Text>
                  <Text
                    component="span"
                    style={{ color: "#2a7fff", cursor: "pointer", fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: "15px" }}
                    onClick={() => { onClose(); setRecoverModalOpened(true); }}
                  >
                    {t('recoverPassword')}
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </form>

          <Divider
            label="OR"
            labelPosition="center"
            styles={{
              label: {
                color: "var(--text-primary)",
                fontWeight: 500,
                fontSize: "18px",
                fontFamily: "var(--font-alexandria), sans-serif",
              },
              root: {
                '--separator-color': 'var(--app-divider-color)',
                borderColor: 'var(--app-divider-color)',
              } as React.CSSProperties,
            }}
          />

          <Button
            fullWidth
            onClick={handleGoogleLogin}
            styles={{
              root: {
                backgroundColor: "#ffffff",
                color: "#3c3c3c",
                height: "40px",
                fontFamily: "var(--font-roboto), sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                borderRadius: "24px",
                border: "1px solid #dadce0",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}
          >
            <Box mr={8} style={{ display: "flex", alignItems: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </Box>
            {t('signInGoogle')}
          </Button>

          <Group justify="center">
            <Button
              type="submit"
              form="login-form"
              loading={isLoading}
              w={200}
              h={40}
              style={{
                background:
                  "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)",
                borderRadius: "20px",
                color: "#fbe6e6",
                fontFamily: "var(--font-alexandria), sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
              }}
            >
              {t('continue')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SignupPopup
        opened={signupModalOpened}
        onClose={() => setSignupModalOpened(false)}
      />

      <RecoverPasswordPopup
        opened={recoverModalOpened}
        onClose={() => setRecoverModalOpened(false)}
      />
    </>
  );
}
