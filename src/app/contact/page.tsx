import { Container, Stack, Title, Text, Paper } from "@mantine/core";

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
        backgroundColor: "#2A305B",
        minHeight: "100vh",
        paddingTop: "40px",
        paddingBottom: "60px",
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <div>
            <Title
              order={1}
              style={{
                color: "#111827",
                fontSize: "56px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Contact Us
            </Title>

            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "#4B5563",
              }}
            />
          </div>

          <Paper
            shadow="none"
            radius={0}
            p="xl"
            style={{
              backgroundColor: "#F3F4F6",
              border: "2px solid #374151",
            }}
          >
            <Stack gap="md">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              >
                Team Contact Information
              </Text>

              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                  lineHeight: 1.7,
                }}
              >
                Feel free to reach out to any of us for questions or concerns.
              </Text>

              <Stack gap="sm" mt="sm">
                {contacts.map((person) => (
                  <Text
                    key={person.email}
                    style={{
                      color: "#111827",
                      fontSize: "18px",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>{person.name}:</strong> {person.email}
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