"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { supabase } from "@/lib/supabase/client";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Box,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { pageTheme, themedInputStyles, themedTextareaStyles } from "@/lib/theme/pageTheme";

const likelihoodKeys = ['veryUnlikely', 'unlikely', 'notSure', 'likely', 'veryLikely'] as const;

/** Values expected by `POST /api/feedback` (see `RETURN_LIKELIHOOD_VALUES` on the server). */
const likelihoodApiValue: Record<(typeof likelihoodKeys)[number], string> = {
  veryUnlikely: "very_unlikely",
  unlikely: "unlikely",
  notSure: "neutral",
  likely: "likely",
  veryLikely: "very_likely",
};

export default function FeedbackPage() {
  const t = useTranslations('feedback');
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
          returnLikelihood:
            returnLikelihood &&
            (likelihoodKeys as readonly string[]).includes(returnLikelihood)
              ? likelihoodApiValue[returnLikelihood as (typeof likelihoodKeys)[number]]
              : "",
          comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setSuccess(t('success'));
      setName("");
      setEmail("");
      setIssues("");
      setFutureIdeas("");
      setReturnLikelihood("");
      setComments("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('error')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        ...pageTheme.shell,
        paddingTop: "clamp(24px, 6vw, 48px)",
        paddingBottom: "clamp(40px, 8vw, 72px)",
        paddingLeft: "clamp(12px, 4vw, 16px)",
        paddingRight: "clamp(12px, 4vw, 16px)",
      }}
    >
      <Container size="md" px={0}>
        <Box
          style={{
            ...pageTheme.panel,
            padding: "clamp(16px, 4vw, 40px) clamp(16px, 5vw, 48px)",
          }}
        >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Stack gap={4}>
              <Title
                order={1}
                style={{
                  color: "var(--text-primary)",
                  fontSize: "clamp(1.35rem, 4vw + 0.5rem, 1.75rem)",
                  lineHeight: 1.2,
                  fontWeight: 600,
                  fontFamily: "var(--font-alexandria), sans-serif",
                }}
              >
                {t('title')}
              </Title>
              <Text
                style={{
                  fontFamily: "var(--font-alexandria), sans-serif",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t('subtitle')}
              </Text>
            </Stack>

            <Divider styles={{ root: { borderColor: "var(--app-divider-color)" } }} />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder={t('name')}
                label={
                  <span style={pageTheme.inputLabel}>
                    {t('name')} <span style={pageTheme.optionalText}>{t('optional')}</span>
                  </span>
                }
                styles={themedInputStyles}
              />
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder={t('email')}
                label={
                  <span style={pageTheme.inputLabel}>
                    {t('email')} <span style={pageTheme.optionalText}>{t('optional')}</span>
                  </span>
                }
                styles={themedInputStyles}
              />
            </SimpleGrid>

            <Textarea
              value={issues}
              onChange={(e) => setIssues(e.currentTarget.value)}
              placeholder={t('issuesPlaceholder')}
              minRows={5}
              autosize
              required
              label={
                <span style={pageTheme.inputLabel}>
                  {t('issues')}
                </span>
              }
              styles={themedTextareaStyles}
            />

            <Textarea
              value={futureIdeas}
              onChange={(e) => setFutureIdeas(e.currentTarget.value)}
              placeholder={t('ideasPlaceholder')}
              minRows={5}
              autosize
              label={
                <span style={pageTheme.inputLabel}>
                  {t('ideas')} <span style={pageTheme.optionalText}>{t('optional')}</span>
                </span>
              }
              styles={themedTextareaStyles}
            />

            <Stack gap="sm">
              <Text id="feedback-return-likelihood-label" style={pageTheme.inputLabel}>
                {t('likelihood')}
              </Text>
              <Box
                role="group"
                aria-labelledby="feedback-return-likelihood-label"
                style={{
                  display: "flex",
                  width: "100%",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid var(--card-border)",
                  background: "var(--option-bg)",
                }}
              >
                {likelihoodKeys.map((key, i) => (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    aria-pressed={returnLikelihood === key}
                    onClick={() => setReturnLikelihood(key)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 48,
                      padding: "10px 6px",
                      border: "none",
                      borderRight:
                        i < likelihoodKeys.length - 1
                          ? "1px solid var(--app-divider-color)"
                          : undefined,
                      cursor: "pointer",
                      textAlign: "center",
                      wordBreak: "break-word",
                      hyphens: "auto",
                      fontFamily: "var(--font-alexandria), sans-serif",
                      fontWeight: 500,
                      fontSize: "clamp(10px, 2.1vw, 13px)",
                      lineHeight: 1.25,
                      color: returnLikelihood === key ? "var(--button-primary-text)" : "var(--text-secondary)",
                      background:
                        returnLikelihood === key
                          ? "var(--button-primary-bg)"
                          : "transparent",
                      transition: "background 0.15s ease, color 0.15s ease",
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
              placeholder={t('commentsPlaceholder')}
              minRows={4}
              autosize
              label={
                <span style={pageTheme.inputLabel}>
                  {t('comments')} <span style={pageTheme.optionalText}>{t('optional')}</span>
                </span>
              }
              styles={themedTextareaStyles}
            />

            {error && (
              <Text c="red.4" fz="sm" style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
                {error}
              </Text>
            )}

            {success && (
              <Text c="green.4" fz="sm" style={{ fontFamily: "var(--font-alexandria), sans-serif" }}>
                {success}
              </Text>
            )}

            <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Button
                type="submit"
                loading={loading}
                w={{ base: "100%", sm: 200 }}
                h={42}
                style={pageTheme.primaryButton}
              >
                {t('submit')}
              </Button>
            </Box>
          </Stack>
        </form>
        </Box>
      </Container>
    </div>
  );
}
