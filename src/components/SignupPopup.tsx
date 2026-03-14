"use client";

import { useState, useMemo } from "react";
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
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";

interface SignupPopupProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignupPopup({ opened, onClose }: SignupPopupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
      password: (value) =>
        value.length >= 8 ? null : "Password must be at least 8 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const passwordStrength = useMemo(() => {
    const password = form.values.password;
    return {
      hasMinLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
    };
  }, [form.values.password]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      // TODO: Implement signup logic here
      console.log("Signup attempt:", values);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google signup logic
    console.log("Google signup clicked");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      styles={{
        content: {
          backgroundColor: "#202642",
        },
        header: {
          backgroundColor: "#202642",
          borderBottomColor: "#202642",
        },
        title: {
          color: "white",
          fontSize: "20px",
          fontWeight: "bold",
          textAlign: "center",
          width: "100%",
        },
        close: {
          color: "white",
        },
      }}
      title="Create Account"
    >
      <Stack gap="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              placeholder="Email"
              {...form.getInputProps("email")}
              required
              styles={{
                input: {
                  backgroundColor: "#525B86",
                  color: "white",
                  borderColor: "#525B86",
                  "&::placeholder": {
                    color: "#9CA3AF",
                    opacity: 1,
                  },
                  "&:focus": {
                    borderColor: "#217AFF",
                  },
                },
              }}
            />

            <PasswordInput
              placeholder="Password"
              {...form.getInputProps("password")}
              required
              styles={{
                input: {
                  backgroundColor: "#525B86",
                  color: "white",
                  borderColor: "#525B86",
                  "&::placeholder": {
                    color: "#9CA3AF",
                    opacity: 1,
                  },
                  "&:focus": {
                    borderColor: "#217AFF",
                  },
                },
              }}
            />

            <Group gap="xs">
              <Badge
                size="sm"
                variant="light"
                styles={{
                  root: {
                    backgroundColor: passwordStrength.hasMinLength
                      ? "#10B981"
                      : "#525B86",
                    color: "white",
                  },
                }}
              >
                {passwordStrength.hasMinLength ? "✓" : "○"} At least 8 characters
              </Badge>
              <Badge
                size="sm"
                variant="light"
                styles={{
                  root: {
                    backgroundColor: passwordStrength.hasNumber
                      ? "#10B981"
                      : "#525B86",
                    color: "white",
                  },
                }}
              >
                {passwordStrength.hasNumber ? "✓" : "○"} At least 1 number
              </Badge>
              <Badge
                size="sm"
                variant="light"
                styles={{
                  root: {
                    backgroundColor: passwordStrength.hasLetter
                      ? "#10B981"
                      : "#525B86",
                    color: "white",
                  },
                }}
              >
                {passwordStrength.hasLetter ? "✓" : "○"} At least 1 letter
              </Badge>
            </Group>

            <PasswordInput
              placeholder="Confirm Password"
              {...form.getInputProps("confirmPassword")}
              required
              styles={{
                input: {
                  backgroundColor: "#525B86",
                  color: "white",
                  borderColor: "#525B86",
                  "&::placeholder": {
                    color: "#9CA3AF",
                    opacity: 1,
                  },
                  "&:focus": {
                    borderColor: "#217AFF",
                  },
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              loading={isLoading}
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, #1B41FF 0%, #217AFF 13.94%, #0054F0 100%)",
              }}
            >
              Create Account
            </Button>
          </Stack>
        </form>

        <Divider
          label="OR"
          labelPosition="center"
          styles={{
            label: {
              color: "#9CA3AF",
              fontSize: "20px",
              fontWeight: "bold",
            },
          }}
        />

        <Button
          fullWidth
          onClick={handleGoogleSignup}
          styles={{
            root: {
              backgroundColor: "#525B86",
              color: "white",
              "&:hover": {
                backgroundColor: "#5F6FA3",
              },
            },
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
      </Stack>
    </Modal>
  );
}
