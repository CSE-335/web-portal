import { Container, Stack, Title, Text, Paper, Box } from "@mantine/core";
import { pageTheme } from "@/lib/theme/pageTheme";

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
        ...pageTheme.shell,
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
                ...pageTheme.title,
                fontSize: "48px",
                marginBottom: "10px",
              }}
            >
              Contact Us
            </Title>

            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "var(--app-divider-color)",
              }}
            />
          </Box>

          <Paper
            shadow="sm"
            radius="md"
            style={{
              ...pageTheme.card,
              padding: "24px 28px",
            }}
          >
            <Stack gap="md">
              <Text
                style={{
                  color: "var(--text-primary)",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Team Contact Information
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "16px",
                }}
              >
                Feel free to reach out to any of us for questions or concerns!
              </Text>

              <Stack gap="sm" mt="sm">
                {contacts.map((person) => (
                  <Text
                    key={person.email}
                    style={{
                      ...pageTheme.body,
                      fontSize: "16px",
                    }}
                  >
                    <strong style={pageTheme.strong}>{person.name}:</strong>{" "}
                    <a
                      href={`mailto:${person.email}`}
                      style={pageTheme.link}
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