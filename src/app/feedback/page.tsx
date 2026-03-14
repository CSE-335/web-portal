import { Container, Stack, Title, Text, TextInput, Textarea, Button, Box } from "@mantine/core";

export default function FeedbackPage() {
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
        <form>
          <Stack gap="xl">
            <Box>
              <Title
                order={1}
                style={{
                  color: "#111827",
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
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <TextInput
                label={
                  <span style={{ color: "#111827", fontSize: "18px", fontWeight: 600 }}>
                    Name{" "}
                    <span style={{ color: "#6B7280", fontWeight: 400, marginLeft: "8px" }}>
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
                label={
                  <span style={{ color: "#111827", fontSize: "18px", fontWeight: 600 }}>
                    Email{" "}
                    <span style={{ color: "#6B7280", fontWeight: 400, marginLeft: "8px" }}>
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
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                What problems or issues did you experience while using the website or
                playing the games?
              </Text>

              <Textarea
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

            <Stack gap="xs">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                What features or games would you like to see in the future?
              </Text>

              <Textarea
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
                  color: "#111827",
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
                      color: "#111827",
                      fontSize: "16px",
                      cursor: "pointer",
                      minWidth: "120px",
                    }}
                  >
                    <input
                      type="radio"
                      name="returnLikelihood"
                      value={label}
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
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                Please provide additional comments or questions.{" "}
                <span style={{ color: "#6B7280" }}>optional</span>
              </Text>

              <Textarea
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
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