"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import {
  Modal,
  Stack,
  Text,
  TextInput,
  Button,
  UnstyledButton,
  Divider,
  Group,
} from "@mantine/core";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AccountSettingsPopupProps {
  opened: boolean;
  onClose: () => void;
  user: User;
}

const sectionLabelStyle = {
  fontFamily: "var(--font-alexandria), sans-serif",
  fontWeight: 400,
  fontSize: "12px",
  color: "var(--text-secondary)",
};

const menuRowStyle = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  padding: "12px 0",
  width: "100%" as const,
  cursor: "pointer" as const,
};

const menuTextStyle = {
  fontFamily: "var(--font-alexandria), sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  color: "var(--text-primary)",
};

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

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

type View = "main" | "email";

export default function AccountSettingsPopup({
  opened,
  onClose,
  user,
}: AccountSettingsPopupProps) {
  const [view, setView] = useState<View>("main");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email update
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const t = useTranslations('accountSettings');

  const email = user.email ?? "";

  const handleClose = () => {
    setView("main");
    setConfirmDelete(false);
    setError(null);
    setNewEmail("");
    setEmailError(null);
    setEmailSent(false);
    onClose();
  };

  const handleLogOutAllDevices = async () => {
    await supabase.auth.signOut({ scope: "global" });
    handleClose();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No active session");
        setDeleting(false);
        return;
      }

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to delete account");
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      handleClose();
      window.location.href = "/";
    } catch {
      setError("Something went wrong");
      setDeleting(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      setEmailError(t('invalidEmail'));
      return;
    }

    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setEmailError(t('sameEmail'));
      return;
    }

    setEmailLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile` }
      );

      if (updateError) {
        setEmailError(updateError.message);
      } else {
        setEmailSent(true);
      }
    } catch {
      setEmailError("Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  };

  const modalStyles = {
    content: {
      backgroundColor: "var(--surface-primary)",
      border: "none",
      borderRadius: "10px",
      overflow: "hidden" as const,
      boxShadow: "var(--modal-shadow)",
    },
    header: {
      backgroundColor: "var(--surface-primary)",
      paddingBottom: 0,
      paddingTop: "8px",
      alignItems: "center" as const,
    },
    body: {
      overflowX: "hidden" as const,
      padding: "8px 32px 24px",
    },
    title: {
      color: "var(--text-primary)",
      fontSize: "18px",
      fontWeight: 600,
      fontFamily: "var(--font-alexandria), sans-serif",
      width: "100%",
      textAlign: "center" as const,
    },
    close: {
      color: "var(--text-primary)",
    },
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size={380}
      styles={modalStyles}
      title={view === "email" ? t('updateEmail') : t('title')}
    >
      {view === "email" ? (
        // Email view
        <Stack gap="md">
          <UnstyledButton
            onClick={() => { setView("main"); setEmailError(null); setEmailSent(false); setNewEmail(""); }}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontFamily: "var(--font-alexandria), sans-serif", fontSize: 13 }}
          >
            <BackArrowIcon />
            {t('back')}
          </UnstyledButton>

          <Stack gap={4}>
            <Text style={sectionLabelStyle}>{t('currentEmail')}</Text>
            <Text style={{ ...menuTextStyle, padding: "8px 0" }}>{email}</Text>
          </Stack>

          <Divider styles={{ root: { borderColor: "var(--border-color)" } }} />

          {emailSent ? (
            <Stack gap="md" align="center" py="md">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 500, fontSize: 15, color: "var(--text-primary)", textAlign: "center" }}>
                {t('emailSentTitle')}
              </Text>
              <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 400, fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}>
                {t('emailSentDesc', { email: newEmail })}
              </Text>
              <Button
                onClick={handleClose}
                style={{
                  background: "linear-gradient(135deg, #2B5FFF 0%, #1B41FF 40%, #0054F0 100%)",
                  borderRadius: "20px",
                  color: "white",
                  fontFamily: "var(--font-alexandria), sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  height: "40px",
                  width: "140px",
                }}
              >
                {t('done')}
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleEmailUpdate}>
              <Stack gap="md">
                <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 400, fontSize: 13, color: "var(--text-secondary)" }}>
                  {t('newEmailDesc')}
                </Text>

                <TextInput
                  placeholder={t('newEmailPlaceholder')}
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.currentTarget.value); setEmailError(null); }}
                  required
                  styles={sharedInputStyles}
                />

                {emailError && (
                  <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontSize: 12, color: "#ef4444" }}>
                    {emailError}
                  </Text>
                )}

                <Group justify="center">
                  <Button
                    type="submit"
                    loading={emailLoading}
                    w={200}
                    h={40}
                    style={{
                      background: "linear-gradient(135deg, #2B5FFF 0%, #1B41FF 40%, #0054F0 100%)",
                      borderRadius: "20px",
                      color: "white",
                      fontFamily: "var(--font-alexandria), sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      border: "none",
                    }}
                  >
                    {t('sendVerification')}
                  </Button>
                </Group>
              </Stack>
            </form>
          )}
        </Stack>
      ) : (
        // Main view
        <Stack gap="md">
          <Stack gap={4}>
            <Text style={sectionLabelStyle}>{t('updateEmail')}</Text>
            <UnstyledButton style={menuRowStyle} onClick={() => setView("email")}>
              <Text style={menuTextStyle}>{email}</Text>
              <ArrowIcon />
            </UnstyledButton>
          </Stack>

          <Divider styles={{ root: { borderColor: "var(--border-color)" } }} />

          <Stack gap={4}>
            <Text style={sectionLabelStyle}>{t('secureAccount')}</Text>
            <UnstyledButton style={menuRowStyle} onClick={handleLogOutAllDevices}>
              <Text style={menuTextStyle}>{t('logOutAll')}</Text>
              <ArrowIcon />
            </UnstyledButton>
          </Stack>

          <Divider styles={{ root: { borderColor: "var(--border-color)" } }} />

          <Stack gap={4}>
            <Text style={sectionLabelStyle}>{t('deleteAccount')}</Text>
            <UnstyledButton
              style={{ ...menuRowStyle, opacity: deleting ? 0.5 : 1 }}
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              <Text
                style={{
                  ...menuTextStyle,
                  color: confirmDelete ? "#ef4444" : "var(--text-primary)",
                }}
              >
                {deleting ? "Deleting..." : confirmDelete ? t('deleteConfirm') : t('deleteButton')}
              </Text>
              <ArrowIcon />
            </UnstyledButton>
            {error && (
              <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontSize: 12, color: "#ef4444" }}>
                {error}
              </Text>
            )}
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
