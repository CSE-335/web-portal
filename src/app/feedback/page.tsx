"use client";

import { useState } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Box,
  Paper,
} from "@mantine/core";

const inputStyles = {
  label: {
    marginBottom: 8,
    color: "#111827",
    fontSize: "16px",
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    color: "#111827",
    minHeight: "48px",
    borderRadius: "10px",
  },
};

const textareaStyles = {
  input: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    color: "#111827",
    borderRadius: "10px",
    lineHeight: 1.6,
  },
};

const likelihoodOptions = [
  "Very Unlikely",
  "Unlikely",
  "Not Sure",
  "Likely",
  "Very Likely",
];

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issues, setIssues] = useState("");
  const [futureIdeas, setFutureIdeas] = useState("");
  const [returnLikelihood, setReturnLikelihood] = useState("");
  const [comments, setComments] = useState("");

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
        headers: {
          "Content-Type": "application/json",
        },
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

      setSuccess("Thanks for your feedback!");

      setName("");
      setEmail("");
      setIssues("");
      setFutureIdeas("");
      setReturnLikelihood("");
      setComments("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong, please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #2F356B 0%, #29315F 100%)",
        minHeight: "100vh",
        paddingTop: "48px",
        paddingBottom: "72px",
      }}
    >
      <Container size="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="2rem">
            <Box>
              <Title
                order={1}
                style={{
                  color: "white",
                  fontSize: "48px",
                  fontWeight: 700,
                  marginBottom: "10px",
                  letterSpacing: "-0.5px",
                }}
              >
                Website Feedback Form
              </Title>

              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "rgba(255,255,255,0.22)",
                }}
              />
            </Box>

            <Paper
              shadow="sm"
              radius="md"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #D1D5DB",
                padding: "24px 28px",
              }}
            >
              <Stack gap="xl">
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "16px",
                    lineHeight: 1.8,
                  }}
                >
                  We’d love to hear your thoughts. Your feedback helps us improve
                  the website, refine the games, and build a better experience
                  for future users.
                </Text>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    label={
                      <>
                        Name{" "}
                        <span
                          style={{
                            color: "#6B7280",
                            fontWeight: 400,
                            marginLeft: 6,
                          }}
                        >
                          optional
                        </span>
                      </>
                    }
                    styles={inputStyles}
                  />

                  <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    label={
                      <>
                        Email{" "}
                        <span
                          style={{
                            color: "#6B7280",
                            fontWeight: 400,
                            marginLeft: 6,
                          }}
                        >
                          optional
                        </span>
                      </>
                    }
                    styles={inputStyles}
                  />
                </div>

                <Stack gap="xs">
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    What problems or issues did you experience while using the
                    website or playing the games?
                  </Text>

                  <Textarea
                    value={issues}
                    onChange={(e) => setIssues(e.currentTarget.value)}
                    minRows={7}
                    autosize
                    required
                    styles={textareaStyles}
                  />
                </Stack>

                <Stack gap="xs">
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    What features or games would you like to see in the future?
                  </Text>

                  <Textarea
                    value={futureIdeas}
                    onChange={(e) => setFutureIdeas(e.currentTarget.value)}
                    minRows={6}
                    autosize
                    styles={textareaStyles}
                  />
                </Stack>

                <Stack gap="sm">
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    What is the likelihood that you will return to this site?
                  </Text>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {likelihoodOptions.map((label) => {
                      const selected = returnLikelihood === label;

                      return (
                        <label
                          key={label}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            padding: "16px 12px",
                            borderRadius: "12px",
                            border: selected
                              ? "2px solid #4C6EF5"
                              : "1px solid #D1D5DB",
                            backgroundColor: selected ? "#EEF2FF" : "#FFFFFF",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="returnLikelihood"
                            value={label}
                            checked={selected}
                            onChange={(e) =>
                              setReturnLikelihood(e.target.value)
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#4C6EF5",
                            }}
                          />
                          <span
                            style={{
                              color: "#111827",
                              fontSize: "14px",
                              fontWeight: selected ? 600 : 500,
                              lineHeight: 1.4,
                            }}
                          >
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Stack>

                <Stack gap="xs">
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Please provide additional comments or questions.{" "}
                    <span style={{ color: "#6B7280", fontWeight: 400 }}>
                      optional
                    </span>
                  </Text>

                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.currentTarget.value)}
                    minRows={6}
                    autosize
                    styles={textareaStyles}
                  />
                </Stack>

                {error && (
                  <Text
                    style={{
                      color: "#B91C1C",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      fontSize: "15px",
                    }}
                  >
                    {error}
                  </Text>
                )}

                {success && (
                  <Text
                    style={{
                      color: "#166534",
                      backgroundColor: "#DCFCE7",
                      border: "1px solid #86EFAC",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      fontSize: "15px",
                    }}
                  >
                    {success}
                  </Text>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    loading={loading}
                    radius="md"
                    style={{
                      backgroundColor: "#4C6EF5",
                      color: "white",
                      border: "none",
                      paddingInline: "22px",
                      height: "42px",
                      fontWeight: 600,
                    }}
                  >
                    Submit Feedback
                  </Button>
                </div>
              </Stack>
            </Paper>
          </Stack>
        </form>
      </Container>
    </div>
  );
}