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

// Updated for Dark Mode
const inputStyles = {
  label: {
    marginBottom: 8,
    color: "#E9ECEF", // Light grey for readability
    fontSize: "16px",
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#25262B", // Deep slate
    border: "1px solid #373A40", // Subtle border
    color: "#C1C2C5",
    minHeight: "48px",
    borderRadius: "10px",
    "&:focus": {
      borderColor: "#4C6EF5",
    },
  },
};

const textareaStyles = {
  label: {
    marginBottom: 8,
    color: "#E9ECEF",
    fontSize: "16px",
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#25262B",
    border: "1px solid #373A40",
    color: "#C1C2C5",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, issues, futureIdeas, returnLikelihood, comments,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit feedback.");

      setSuccess("Thanks for your feedback!");
      setName(""); setEmail(""); setIssues(""); setFutureIdeas(""); setReturnLikelihood(""); setComments("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#141517", // Solid deep dark background
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
                  color: "#FFFFFF",
                  fontSize: "48px",
                  fontWeight: 700,
                  marginBottom: "10px",
                  letterSpacing: "-0.5px",
                }}
              >
                Website Feedback Form
              </Title>
              <div style={{ width: "100%", height: "1px", backgroundColor: "#2C2E33" }} />
            </Box>

            <Paper
              shadow="xl"
              radius="md"
              style={{
                backgroundColor: "#1A1B1E", // Slightly lighter than background to create elevation
                border: "1px solid #2C2E33",
                padding: "24px 28px",
              }}
            >
              <Stack gap="xl">
                <Text style={{ color: "#909296", fontSize: "16px", lineHeight: 1.8 }}>
                  We’d love to hear your thoughts. Your feedback helps us improve the website, 
                  refine the games, and build a better experience for future users.
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
                    label={<Text size="sm" fw={600} c="gray.3">Name <span style={{ color: "#5C5F66", fontWeight: 400 }}>optional</span></Text>}
                    styles={inputStyles}
                  />

                  <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    label={<Text size="sm" fw={600} c="gray.3">Email <span style={{ color: "#5C5F66", fontWeight: 400 }}>optional</span></Text>}
                    styles={inputStyles}
                  />
                </div>

                <Stack gap="xs">
                  <Text fw={600} c="gray.3">What problems did you experience?</Text>
                  <Textarea
                    value={issues}
                    onChange={(e) => setIssues(e.currentTarget.value)}
                    minRows={5}
                    autosize
                    required
                    styles={textareaStyles}
                  />
                </Stack>

                <Stack gap="sm">
                  <Text fw={600} c="gray.3">Likelihood of returning?</Text>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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
                            gap: "10px",
                            padding: "16px 12px",
                            borderRadius: "12px",
                            border: selected ? "2px solid #4C6EF5" : "1px solid #373A40",
                            backgroundColor: selected ? "rgba(76, 110, 245, 0.1)" : "#25262B",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="returnLikelihood"
                            value={label}
                            checked={selected}
                            onChange={(e) => setReturnLikelihood(e.target.value)}
                            style={{ accentColor: "#4C6EF5" }}
                          />
                          <span style={{ color: selected ? "#74C0FC" : "#C1C2C5", fontSize: "14px", fontWeight: selected ? 600 : 500 }}>
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Stack>

                {error && (
                  <Text style={{ color: "#FF8787", backgroundColor: "rgba(255, 135, 135, 0.1)", border: "1px solid #C92A2A", padding: "12px", borderRadius: "10px" }}>
                    {error}
                  </Text>
                )}

                {success && (
                  <Text style={{ color: "#8ce99a", backgroundColor: "rgba(43, 138, 62, 0.1)", border: "1px solid #2b8a3e", padding: "12px", borderRadius: "10px" }}>
                    {success}
                  </Text>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    loading={loading}
                    size="md"
                    radius="md"
                    style={{ backgroundColor: "#4C6EF5", fontWeight: 600 }}
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