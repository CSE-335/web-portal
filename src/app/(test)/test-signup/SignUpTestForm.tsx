"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button, TextInput, PasswordInput } from "@mantine/core";
import { signUpNewUser, signInWithGoogle } from "@/lib/supabase";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

export function SignUpTestForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth") setError("Google sign-in failed. Please try again.");
    if (err === "no_code") setError("Missing auth code. Please try again.");
    if (err === "config") setError("Auth is misconfigured.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await signUpNewUser(email, password, {
      displayName: displayName.trim() || undefined,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(
        result.userId
          ? `Account created. User ID: ${result.userId}`
          : "Account created successfully."
      );
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  const inputStyles = {
    label: { color: "white" },
    input: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "white",
    },
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        size="md"
        styles={inputStyles}
      />
      <PasswordInput
        label="Password"
        placeholder="At least 6 characters, 1 letter, 1 number"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        size="md"
        styles={inputStyles}
      />
      <TextInput
        label="Display name (optional)"
        placeholder="Jane"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        size="md"
        styles={inputStyles}
      />
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400" role="status">
          {success}
        </p>
      )}
      <Button
        type="submit"
        size="md"
        loading={loading}
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        Create account
      </Button>

      <p className="text-center text-sm text-white/70">or</p>

      <Button
        type="button"
        variant="outline"
        size="md"
        color="gray"
        onClick={async () => {
          const { error: googleError } = await signInWithGoogle("/auth/callback");
          if (googleError) setError(googleError);
        }}
        styles={{
          root: { borderColor: "rgba(255,255,255,0.3)", color: "white" },
        }}
      >
        Sign in with Google
      </Button>
    </form>
  );
}
