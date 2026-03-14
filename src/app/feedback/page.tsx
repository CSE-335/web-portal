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
} from "@mantine/core";

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

      setSuccess("Feedback submitted successfully.");

      setName("");
      setEmail("");
      setIssues("");
      setFutureIdeas("");
      setReturnLikelihood("");
      setComments("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#2A305B",
        minHeight: "100vh",
        paddingTop: "40px",
        paddingBottom: "60px",
      }}
    >
      <Container size="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="xl">
            <Box>
              <Title
                order={1}
                style={{
                  color: "white",
                  fontSize: "56px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                Website Feedback Form
              </Title>

              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "#4B5563",
                }}
              />
            </Box>

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
                  <span
                    style={{ color: "white", fontSize: "18px", fontWeight: 600 }}
                  >
                    Name{" "}
                    <span
                      style={{
                        color: "#9CA3AF",
                        fontWeight: 400,
                        marginLeft: "8px",
                      }}
                    >
                      optional
                    </span>
                  </span>
                }
                styles={{
                  label: {
                    marginBottom: 8,
                  },
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                    minHeight: "48px",
                  },
                }}
              />

              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                label={
                  <span
                    style={{ color: "white", fontSize: "18px", fontWeight: 600 }}
                  >
                    Email{" "}
                    <span
                      style={{
                        color: "#9CA3AF",
                        fontWeight: 400,
                        marginLeft: "8px",
                      }}
                    >
                      optional
                    </span>
                  </span>
                }
                styles={{
                  label: {
                    marginBottom: 8,
                  },
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                    minHeight: "48px",
                  },
                }}
              />
            </div>

            <Stack gap="xs">
              <Text
                style={{
                  color: "white",
                  fontSize: "18px",
                }}
              >
                What problems or issues did you experience while using the website
                or playing the games?
              </Text>

              <Textarea
                value={issues}
                onChange={(e) => setIssues(e.currentTarget.value)}
                minRows={8}
                autosize
                required
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            <Stack gap="xs">
              <Text
                style={{
                  color: "white",
                  fontSize: "18px",
                }}
              >
                What features or games would you like to see in the future?
              </Text>

              <Textarea
                value={futureIdeas}
                onChange={(e) => setFutureIdeas(e.currentTarget.value)}
                minRows={8}
                autosize
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            <Stack gap="md">
              <Text
                style={{
                  color: "white",
                  fontSize: "18px",
                }}
              >
                What is the likelihood that you will return to this site?
              </Text>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  "Very Unlikely",
                  "Unlikely",
                  "Not Sure",
                  "Likely",
                  "Very Likely",
                ].map((label) => (
                  <label
                    key={label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      color: "white",
                      fontSize: "16px",
                      cursor: "pointer",
                      minWidth: "120px",
                    }}
                  >
                    <input
                      type="radio"
                      name="returnLikelihood"
                      value={label}
                      checked={returnLikelihood === label}
                      onChange={(e) => setReturnLikelihood(e.target.value)}
                      style={{
                        width: "28px",
                        height: "28px",
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </Stack>

            <Stack gap="xs">
              <Text
                style={{
                  color: "white",
                  fontSize: "18px",
                }}
              >
                Please provide additional comments or questions.{" "}
                <span style={{ color: "#9CA3AF" }}>optional</span>
              </Text>

              <Textarea
                value={comments}
                onChange={(e) => setComments(e.currentTarget.value)}
                minRows={8}
                autosize
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            {error && (
              <Text style={{ color: "#FCA5A5", fontSize: "16px" }}>{error}</Text>
            )}

            {success && (
              <Text style={{ color: "#86EFAC", fontSize: "16px" }}>{success}</Text>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                loading={loading}
                style={{
                  backgroundColor: "#6B8FB3",
                  color: "white",
                  border: "1px solid #4B5563",
                }}
              >
                Submit
              </Button>
            </div>
          </Stack>
        </form>
      </Container>
    </div>
  );
}