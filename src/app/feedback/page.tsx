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
  Group,
  Box,
  Divider,
} from "@mantine/core";

const inputStyles = {
  wrapper: {
    borderRadius: "10px",
    background:
      "linear-gradient(#525b85, #525b85) padding-box, linear-gradient(to bottom, #7886bf, #6e91d0) border-box",
    border: "2px solid transparent",
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    height: "46px",
    fontSize: "15px",
    fontFamily: "var(--font-alexandria), sans-serif",
    fontWeight: 400,
    paddingLeft: "20px",
  },
};

const textareaStyles = {
  wrapper: {
    borderRadius: "10px",
    background:
      "linear-gradient(#525b85, #525b85) padding-box, linear-gradient(to bottom, #7886bf, #6e91d0) border-box",
    border: "2px solid transparent",
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    fontSize: "15px",
    fontFamily: "var(--font-alexandria), sans-serif",
    fontWeight: 400,
    padding: "14px 20px",
  },
};

const labelStyle = {
  fontFamily: "var(--font-alexandria), sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  color: "white",
  marginBottom: "6px",
};

const likelihoodKeys = ['veryUnlikely', 'unlikely', 'notSure', 'likely', 'veryLikely'] as const;

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
          returnLikelihood,
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
    <Container size="md" py={48}>
      <Box
        style={{
          backgroundColor: "#1f2542",
          border: "1px solid #6e90b6",
          borderRadius: "10px",
          padding: "40px 48px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Stack gap={4}>
              <Title
                order={1}
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontWeight: 600,
                  fontFamily: "var(--font-alexandria), sans-serif",
                }}
              >
                {t('title')}
              </Title>
              <Text
                style={{
                  fontFamily: "var(--font-alexandria), sans-serif",
                  fontSize: "14px",
                  color: "#9CA3AF",
                }}
              >
                {t('subtitle')}
              </Text>
            </Stack>

            <Divider styles={{ root: { borderColor: "#344369" } }} />

            <Group grow gap="md">
              <TextInput
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder={t('name')}
                label={
                  <span style={labelStyle}>
                    {t('name')} <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "13px" }}>{t('optional')}</span>
                  </span>
                }
                styles={inputStyles}
              />
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder={t('email')}
                label={
                  <span style={labelStyle}>
                    {t('email')} <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "13px" }}>{t('optional')}</span>
                  </span>
                }
                styles={inputStyles}
              />
            </Group>

            <Textarea
              value={issues}
              onChange={(e) => setIssues(e.currentTarget.value)}
              placeholder={t('issuesPlaceholder')}
              minRows={5}
              autosize
              required
              label={
                <span style={labelStyle}>
                  {t('issues')}
                </span>
              }
              styles={textareaStyles}
            />

            <Textarea
              value={futureIdeas}
              onChange={(e) => setFutureIdeas(e.currentTarget.value)}
              placeholder={t('ideasPlaceholder')}
              minRows={5}
              autosize
              label={
                <span style={labelStyle}>
                  {t('ideas')} <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "13px" }}>{t('optional')}</span>
                </span>
              }
              styles={textareaStyles}
            />

            <Stack gap="sm">
              <Text style={labelStyle}>
                {t('likelihood')}
              </Text>
              <Group gap={8} wrap="nowrap">
                {likelihoodKeys.map((key) => (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    onClick={() => setReturnLikelihood(key)}
                    style={{
                      flex: 1,
                      padding: "10px 4px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                      fontFamily: "var(--font-alexandria), sans-serif",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: returnLikelihood === key ? "white" : "#9CA3AF",
                      background:
                        returnLikelihood === key
                          ? "linear-gradient(135deg, #1b41ff, #0054f0)"
                          : "#525b85",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t(key)}
                  </Box>
                ))}
              </Group>
            </Stack>

            <Textarea
              value={comments}
              onChange={(e) => setComments(e.currentTarget.value)}
              placeholder={t('commentsPlaceholder')}
              minRows={4}
              autosize
              label={
                <span style={labelStyle}>
                  {t('comments')} <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "13px" }}>{t('optional')}</span>
                </span>
              }
              styles={textareaStyles}
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

            <Group justify="flex-end">
              <Button
                type="submit"
                loading={loading}
                w={200}
                h={42}
                style={{
                  background: "linear-gradient(to bottom, #1b41ff 0%, #0054f0 100%)",
                  borderRadius: "20px",
                  color: "#fbe6e6",
                  fontFamily: "var(--font-alexandria), sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                }}
              >
                {t('submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
