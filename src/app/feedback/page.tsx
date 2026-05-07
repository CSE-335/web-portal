"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@mantine/hooks";
import { supabase } from "@/lib/supabase/client";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import {
  staticInfoPageShell,
  staticInfoPageTitle,
  staticInfoCardSurface,
  staticInfoLabel,
  staticInfoOptional,
  staticInfoCardPadding,
  staticInfoBlockGap,
  themedInputStyles,
  themedTextareaStyles,
  pageTheme,
} from "@/lib/theme/pageTheme";

const likelihoodKeys = ["veryUnlikely", "unlikely", "notSure", "likely", "veryLikely"] as const;
const CONTACT_TEAM_ERROR_SUFFIX = "Please contact the team for further help.";

const cardStyle = { ...staticInfoCardSurface, padding: staticInfoCardPadding };

export default function FeedbackPage() {
  const t = useTranslations("feedback");
  const isNarrow = useMediaQuery("(max-width: 639.9px)");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issues, setIssues] = useState("");
  const [futureIdeas, setFutureIdeas] = useState("");
  const [returnLikelihood, setReturnLikelihood] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          issues,
          futureIdeas,
          returnLikelihood,
          comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setSuccess(t("success"));
      setName("");
      setEmail("");
      setIssues("");
      setFutureIdeas("");
      setReturnLikelihood("");
      setComments("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  const showContactTeamLink = error.includes(CONTACT_TEAM_ERROR_SUFFIX);

  return (
    <div style={staticInfoPageShell}>
      <Container size="lg">
        <Stack style={{ gap: staticInfoBlockGap }}>
          <Box>
            <Title order={1} style={staticInfoPageTitle}>
              {t("title")}
            </Title>
            <Text
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(0.8125rem, 1.5vw + 0.65rem, 0.9375rem)",
                marginTop: "4px",
                lineHeight: 1.45,
              }}
            >
              {t("subtitle")}
            </Text>
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "var(--app-divider-color)",
                marginTop: "12px",
              }}
            />
          </Box>

          <Paper shadow="none" radius="lg" style={cardStyle}>
            <form onSubmit={handleSubmit}>
              <Stack style={{ gap: "clamp(1rem, 2.5vw, 1.5rem)" }}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} style={{ gap: "clamp(0.75rem, 2vw, 1rem)" }}>
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder={t("name")}
                    label={
                      <span style={staticInfoLabel}>
                        {t("name")} <span style={staticInfoOptional}>{t("optional")}</span>
                      </span>
                    }
                    styles={themedInputStyles}
                  />
                  <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    placeholder={t("email")}
                    label={
                      <span style={staticInfoLabel}>
                        {t("email")} <span style={staticInfoOptional}>{t("optional")}</span>
                      </span>
                    }
                    styles={themedInputStyles}
                  />
                </SimpleGrid>

                <Textarea
                  value={issues}
                  onChange={(e) => setIssues(e.currentTarget.value)}
                  placeholder={t("issuesPlaceholder")}
                  minRows={5}
                  autosize
                  required
                  label={<span style={staticInfoLabel}>{t("issues")}</span>}
                  styles={themedTextareaStyles}
                />

                <Textarea
                  value={futureIdeas}
                  onChange={(e) => setFutureIdeas(e.currentTarget.value)}
                  placeholder={t("ideasPlaceholder")}
                  minRows={5}
                  autosize
                  label={
                    <span style={staticInfoLabel}>
                      {t("ideas")} <span style={staticInfoOptional}>{t("optional")}</span>
                    </span>
                  }
                  styles={themedTextareaStyles}
                />

                <Stack gap="sm">
                  <Text style={staticInfoLabel}>{t("likelihood")}</Text>
                  <Box
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      gap: "clamp(0.35rem, 1.5vw, 0.5rem)",
                      overflowX: "visible",
                    }}
                  >
                    {likelihoodKeys.map((key) => (
                      <Box
                        key={key}
                        component="button"
                        type="button"
                        onClick={() => setReturnLikelihood(key)}
                        style={{
                          padding: isNarrow ? "8px 4px" : "10px 8px",
                          minHeight: isNarrow ? 40 : 44,
                          borderRadius: "12px",
                          border:
                            returnLikelihood === key
                              ? "2px solid transparent"
                              : "1px solid var(--about-border-strong)",
                          cursor: "pointer",
                          textAlign: "center",
                          fontFamily: "var(--font-alexandria), sans-serif",
                          fontWeight: 500,
                          fontSize: isNarrow
                            ? "clamp(0.58rem, 0.8vw + 0.5rem, 0.66rem)"
                            : "clamp(0.6875rem, 1vw + 0.55rem, 0.75rem)",
                          lineHeight: 1.25,
                          flex: "1 1 0",
                          minWidth: 0,
                          color:
                            returnLikelihood === key
                              ? "var(--button-primary-text)"
                              : "var(--text-secondary)",
                          background:
                            returnLikelihood === key
                              ? "var(--button-primary-bg)"
                              : "var(--surface-secondary)",
                          transition: "background 0.2s ease, color 0.2s ease",
                        }}
                      >
                        {t(key)}
                      </Box>
                    ))}
                  </Box>
                </Stack>

                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.currentTarget.value)}
                  placeholder={t("commentsPlaceholder")}
                  minRows={4}
                  autosize
                  label={
                    <span style={staticInfoLabel}>
                      {t("comments")} <span style={staticInfoOptional}>{t("optional")}</span>
                    </span>
                  }
                  styles={themedTextareaStyles}
                />

                {error && (
                  <Text c="red.4" fz="sm" style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
                    {showContactTeamLink ? (
                      <>
                        {"There was an error submitting your feedback. Please contact the "}
                        <Link
                          href="/contact"
                          style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}
                        >
                          team
                        </Link>
                        {" for further help."}
                      </>
                    ) : (
                      error
                    )}
                  </Text>
                )}

                {success && (
                  <Text c="green.4" fz="sm" style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
                    {success}
                  </Text>
                )}

                <Group justify={isNarrow ? "stretch" : "flex-end"} wrap="nowrap">
                  <Button
                    type="submit"
                    loading={loading}
                    h={42}
                    style={{
                      ...pageTheme.primaryButton,
                      width: isNarrow ? "100%" : 200,
                      maxWidth: isNarrow ? "100%" : 200,
                    }}
                  >
                    {t("submit")}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
