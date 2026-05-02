import { Container, Stack, Title, Text, Paper, Box } from "@mantine/core";
import { pageTheme } from "@/lib/theme/pageTheme";

const CONTACT_EMAIL = "llnlcoolstemgames@gmail.com";

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
                Reach LLNL STEM Games
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "16px",
                }}
              >
                For questions, support, or anything else about this site and
                our games, please contact us at the email below!
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "16px",
                  marginTop: "4px",
                }}
              >
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  style={pageTheme.link}
                >
                  {CONTACT_EMAIL}
                </a>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
