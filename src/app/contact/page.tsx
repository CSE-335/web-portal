import { Container, Stack, Title, Text, Paper, Box } from "@mantine/core";

const contacts = [
  { name: "Arielle Talania", email: "atalania@ucmerced.edu" },
  { name: "Djeinabou Bah", email: "dbah@ucmerced.edu" },
  { name: "Natalie Parker", email: "nparker2@ucmerced.edu" },
  { name: "Sergio Gonzalez", email: "sgonzalezborbon@ucmerced.edu" },
  { name: "Ethan Reed", email: "ethanreed@ucmerced.edu" },
];

export default function ContactPage() {
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
              Contact Us
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
            <Stack gap="md">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Team Contact Information
              </Text>

              <Text
                style={{
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: 1.8,
                }}
              >
                Feel free to reach out to any of us for questions or concerns!
              </Text>

              <Stack gap="sm" mt="sm">
                {contacts.map((person) => (
                  <Text
                    key={person.email}
                    style={{
                      color: "#374151",
                      fontSize: "16px",
                      lineHeight: 1.7,
                    }}
                  >
                    <strong style={{ color: "#111827" }}>{person.name}:</strong>{" "}
                    <a
                      href={`mailto:${person.email}`}
                      style={{
                        color: "#2F5DCC",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {person.email}
                    </a>
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}