"use client";

import { useState, useMemo } from "react";
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
import { signUpNewUser, signInWithGoogle } from "@/lib/supabase/auth";
import { validateUsername, isUsernameTaken, createUserProfile, getUsernameChecks } from "@/lib/supabase/user-profile";
import { supabase } from "@/lib/supabase/client";

interface SignupPopupProps {
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

const passwordInputStyles = {
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
};

export default function SignupPopup({ opened, onClose }: SignupPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const t = useTranslations('signup');

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      username: (value) => validateUsername(value),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : t('invalidEmail'),
      password: (value) =>
        value.length >= 6 ? null : t('passwordShort'),
      confirmPassword: (value, values) =>
        value === values.password ? null : t('passwordMismatch'),
    },
  });

  const usernameChecks = useMemo(() => getUsernameChecks(form.values.username), [form.values.username]);

  const passwordStrength = useMemo(() => {
    const password = form.values.password;
    return {
      hasMinLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
    };
  }, [form.values.password]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Check username uniqueness before creating account
      const taken = await isUsernameTaken(values.username);
      if (taken) {
        setError("Username is already taken.");
        return;
      }

      const result = await signUpNewUser(values.email, values.password, {
        displayName: values.username,
      });

      if (result.success) {
        // Create user profile with the chosen username
        await createUserProfile(supabase, { displayName: values.username });
        setSuccess("Account created successfully.");
        form.reset();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError);
    }
  };

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
        <form id="signup-form" onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              placeholder="Username"
              {...form.getInputProps("username")}
              required
              maxLength={15}
              styles={sharedInputStyles}
            />

            <Group gap={6} wrap="nowrap">
              {[
                { met: usernameChecks.hasMinLength, label: "6+ chars" },
                { met: usernameChecks.validChars, label: "Letters, numbers, . and _" },
              ].map(({ met, label }) => (
                <Box
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: met
                      ? "linear-gradient(135deg, #10B981, #059669)"
                      : "linear-gradient(135deg, #3a4170, #2d3460)",
                    fontFamily: "var(--font-alexandria), sans-serif",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {met ? "\u2713" : "\u2717"} {label}
                </Box>
              ))}
            </Group>

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
              styles={passwordInputStyles}
            />

            <Group gap={6} wrap="nowrap">
              {[
                { met: passwordStrength.hasMinLength, label: `6+ ${t('characters')}` },
                { met: passwordStrength.hasNumber, label: `1+ ${t('number')}` },
                { met: passwordStrength.hasLetter, label: `1+ ${t('letter')}` },
              ].map(({ met, label }) => (
                <Box
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: met
                      ? "linear-gradient(135deg, #10B981, #059669)"
                      : "linear-gradient(135deg, #3a4170, #2d3460)",
                    fontFamily: "var(--font-alexandria), sans-serif",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {met ? "\u2713" : "\u2717"} {label}
                </Box>
              ))}
            </Group>

            <PasswordInput
              placeholder={t('confirmPassword')}
              {...form.getInputProps("confirmPassword")}
              required
              styles={passwordInputStyles}
            />

            {error && (
              <Text c="red.4" fz="sm">
                {error}
              </Text>
            )}

            {success && (
              <Text c="green.4" fz="sm">
                {success}
              </Text>
            )}
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
              borderColor: "var(--border-color)",
            },
          }}
        />

        <Button
          fullWidth
          onClick={handleGoogleSignup}
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
          {t('signUpGoogle')}
        </Button>

        <Group justify="center">
          <Button
            type="submit"
            form="signup-form"
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
  );
}
