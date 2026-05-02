"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useMantineColorScheme } from "@mantine/core";
import {
  Drawer,
  Stack,
  Text,
  TextInput,
  Select,
  Button,
  Divider,
  UnstyledButton,
  Box,
  Group,
} from "@mantine/core";
import type { User } from "@supabase/supabase-js";
import { signOutUser } from "@/lib/supabase/auth";
import { generateUsername } from "@/lib/utils/generateUsername";
import { getUserProfile, updateUserProfile, validateUsername, isUsernameTaken } from "@/lib/supabase/user-profile";
import AccountSettingsPopup from "./AccountSettingsPopup";

interface ProfilePopupProps {
  opened: boolean;
  onClose: () => void;
  user: User;
  initialView?: "main" | "edit";
}

type View = "main" | "edit";

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 0",
  color: "var(--text-primary)",
  fontFamily: "var(--font-alexandria), sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  width: "100%",
  cursor: "pointer",
};

const inputStyles = {
  wrapper: {
    borderRadius: "10px",
    background: "var(--surface-secondary)",
    border: "none",
    boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-subtle)",
  },
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
  label: {
    fontFamily: "var(--font-alexandria), sans-serif",
    fontWeight: 400,
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
    paddingLeft: "20px",
  },
};

const LOCATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "Mexico",
  "South Korea",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Other",
];

function BackHeader({ title, onBack, onClose }: { title: string; onBack: () => void; onClose: () => void }) {
  return (
    <Group justify="space-between" align="center" py="sm">
      <UnstyledButton onClick={onBack} style={{ color: "var(--text-primary)", display: "flex", alignItems: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </UnstyledButton>
      <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>
        {title}
      </Text>
      <UnstyledButton onClick={onClose} style={{ color: "var(--text-primary)", display: "flex", alignItems: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </UnstyledButton>
    </Group>
  );
}

export default function ProfilePopup({ opened, onClose, user, initialView = "main" }: ProfilePopupProps) {
  const [accountSettingsOpened, setAccountSettingsOpened] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const [prevOpened, setPrevOpened] = useState(false);
  const router = useRouter();
  const t = useTranslations('profile');
  const { colorScheme } = useMantineColorScheme();

  const [editUsername, setEditUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const displayName = user.user_metadata?.display_name || generateUsername(user.id);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const avatarUrl = profileAvatarUrl || user.user_metadata?.avatar_url || "/images/bobcat.png";
  const email = user.email ?? "";

  // Reset view on open
  if (opened && !prevOpened) {
    setPrevOpened(true);
    setView(initialView);
    setSaveMessage("");
  }
  if (!opened && prevOpened) {
    setPrevOpened(false);
  }

  useEffect(() => {
    if (opened) {
      getUserProfile(user.id).then((profile) => {
        setEditUsername(profile?.display_name || displayName);
        setEditLocation(profile?.locale || null);
        setProfileAvatarUrl(profile?.avatar_url || null);
      }).catch(() => {
        setProfileAvatarUrl(null);
      });
    }
  }, [opened, user.id, displayName]);

  const handleSignOut = async () => {
    await signOutUser();
    onClose();
  };

  const handleUsernameChange = (value: string) => {
    setEditUsername(value);
    setSaveMessage("");
    if (value.length === 0) {
      setUsernameError(null);
    } else {
      setUsernameError(validateUsername(value));
    }
  };

  const handleSaveProfile = async () => {
    // Validate
    if (editUsername) {
      const validationError = validateUsername(editUsername);
      if (validationError) {
        setUsernameError(validationError);
        return;
      }

      // Check if taken
      const taken = await isUsernameTaken(editUsername, user.id);
      if (taken) {
        setUsernameError("Username is already taken");
        return;
      }
    }

    setSaving(true);
    setSaveMessage("");
    setUsernameError(null);
    const result = await updateUserProfile({
      display_name: editUsername || null,
      locale: editLocation,
    });
    setSaving(false);
    if (result.error) {
      setSaveMessage(result.error);
    } else {
      setSaveMessage(t('saved'));
      setTimeout(() => setView("main"), 800);
    }
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size={340}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.3, blur: 0.8 }}
        styles={{
          content: {
            backgroundColor: "var(--surface-primary)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          },
          header: {
            backgroundColor: "var(--surface-primary)",
            paddingBottom: 0,
          },
          body: {
            padding: "0 28px 24px",
            position: "relative",
          },
        }}
      >
        {view === "edit" ? (
          // Edit view
          <Stack gap="md">
            <BackHeader title={t('editTitle')} onBack={() => setView("main")} onClose={onClose} />

            <Stack align="center" gap="sm">
              <Box style={{ position: "relative" }}>
                <Box style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--text-muted)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt="Profile" width={90} height={90} style={{ objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "/images/bobcat.png"; }} />
                </Box>
                <Box style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #1b41ff, #0054f0)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--surface-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </Box>
              </Box>
            </Stack>

            <Divider styles={{ root: { borderColor: "var(--border-color)" } }} />

            <div>
              <TextInput
                label={t('usernameLabel')}
                value={editUsername}
                onChange={(e) => handleUsernameChange(e.currentTarget.value)}
                placeholder={t('usernamePlaceholder')}
                maxLength={15}
                styles={inputStyles}
              />
              {usernameError && (
                <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontSize: 11, color: "#ef4444", marginTop: 4, paddingLeft: 20 }}>
                  {usernameError}
                </Text>
              )}
              <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontSize: 11, color: "#6B7280", marginTop: 2, paddingLeft: 20 }}>
                6-15 characters. Letters, numbers, . and _ only.
              </Text>
            </div>

            <Select
              label={t('locationLabel')}
              value={editLocation}
              onChange={setEditLocation}
              placeholder={t('locationPlaceholder')}
              data={LOCATIONS}
              clearable
              styles={{
                wrapper: inputStyles.wrapper,
                input: { ...inputStyles.input, cursor: "pointer" },
                label: inputStyles.label,
                dropdown: { backgroundColor: "var(--surface-secondary)", border: "1px solid var(--text-muted)" },
                option: { color: "var(--text-primary)", fontFamily: "var(--font-alexandria), sans-serif", fontSize: "14px" },
              }}
            />

            {saveMessage && (
              <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontSize: 13, color: saveMessage === t('saved') ? "#10B981" : "#ef4444", textAlign: "center" }}>
                {saveMessage}
              </Text>
            )}

            <Button
              fullWidth
              loading={saving}
              disabled={!!usernameError}
              onClick={handleSaveProfile}
              style={{ background: usernameError ? "#3a4170" : "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)", borderRadius: "20px", color: "#fbe6e6", fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 700, fontSize: "14px", border: "none", height: "40px" }}
            >
              {t('saveChanges')}
            </Button>
          </Stack>

        ) : (
          // Main view
          <>
            <UnstyledButton onClick={onClose} style={{ position: "absolute", top: 12, right: 14, color: "var(--text-primary)", display: "flex", alignItems: "center", zIndex: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </UnstyledButton>

            <Stack gap="md" align="center" pt={36}>
              <Box style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(110, 144, 182, 0.8)", boxShadow: "0 0 12px rgba(27, 65, 255, 0.35), 0 0 4px rgba(110, 144, 182, 0.3)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Profile" width={80} height={80} style={{ objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "/images/bobcat.png"; }} />
              </Box>

              <Stack gap={2} align="center">
                <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 600, fontSize: "18px", color: "var(--text-primary)" }}>
                  @{displayName}
                </Text>
                <Text style={{
                  fontFamily: "var(--font-alexandria), sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  background: colorScheme === "light"
                    ? "linear-gradient(90deg, #003087 0%, #1B41FF 30%, #4a6fff 50%, #1B41FF 70%, #003087 100%)"
                    : "linear-gradient(90deg, #6ea8ff 0%, #a78bfa 30%, #60c8ff 50%, #a78bfa 70%, #6ea8ff 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3s linear infinite",
                  filter: colorScheme === "light"
                    ? "drop-shadow(0 0 8px rgba(27, 65, 255, 0.6)) drop-shadow(0 0 16px rgba(0, 48, 135, 0.3))"
                    : "drop-shadow(0 0 6px rgba(110, 168, 255, 0.5))",
                }}>
                  {email}
                </Text>
              </Stack>

              <Button
                fullWidth
                onClick={() => { onClose(); router.push("/profile"); }}
                style={{ background: "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)", borderRadius: "20px", color: "#fbe6e6", fontFamily: "var(--font-alexandria), sans-serif", fontWeight: 700, fontSize: "14px", border: "none", height: "40px" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                {t('menuProfile')}
              </Button>
            </Stack>

            <Divider my="md" styles={{ root: { borderColor: "var(--border-color)" } }} />

            <Stack gap={0}>
              <UnstyledButton style={menuItemStyle} onClick={() => setView("edit")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                {t('menuEditProfile')}
              </UnstyledButton>

              <UnstyledButton style={menuItemStyle} onClick={() => { onClose(); setAccountSettingsOpened(true); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {t('menuAccountSettings')}
              </UnstyledButton>

              <UnstyledButton style={menuItemStyle} onClick={handleSignOut}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t('menuLogOut')}
              </UnstyledButton>
            </Stack>

            <Divider my="sm" styles={{ root: { borderColor: "var(--border-color)" } }} />

            <UnstyledButton style={menuItemStyle} onClick={() => { onClose(); router.push("/feedback"); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
              {t('menuContactUs')}
            </UnstyledButton>

            <UnstyledButton
              component="a"
              href="https://www.llnl.gov/"
              target="_blank"
              rel="noopener noreferrer"
              style={menuItemStyle}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {t('menuPartner')}
            </UnstyledButton>

          </>
        )}
      </Drawer>

      <AccountSettingsPopup
        opened={accountSettingsOpened}
        onClose={() => setAccountSettingsOpened(false)}
        user={user}
      />
    </>
  );
}
