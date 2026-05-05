import { Container, Stack, Title, Text, Paper, Box } from "@mantine/core";
import {
  staticInfoPageShell,
  staticInfoPageTitle,
  staticInfoCardSurface,
  staticInfoSectionTitle,
  staticInfoBody,
  staticInfoCardPadding,
  staticInfoBlockGap,
  pageTheme,
} from "@/lib/theme/pageTheme";

const CONTACT_EMAIL = "llnlcoolstemgames@gmail.com";

const cardStyle = { ...staticInfoCardSurface, padding: staticInfoCardPadding };

export default function ContactPage() {
  return (
    <div style={staticInfoPageShell}>
      <Container size="lg">
        <Stack style={{ gap: staticInfoBlockGap }}>
          <Box>
            <Title order={1} style={staticInfoPageTitle}>
              Contact Us
            </Title>

            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "var(--app-divider-color)",
                marginTop: "2px",
              }}
            />
          </Box>

          <Paper shadow="none" radius="lg" style={cardStyle}>
            <Stack gap="md">
              <Text style={staticInfoSectionTitle}>Reach LLNL STEM Games</Text>

              <Text style={staticInfoBody}>
                For questions, support, or anything else about this site and
                our games, please contact us at the email below!
              </Text>

              <Text
                style={{
                  ...staticInfoBody,
                  marginTop: "4px",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  style={{ ...pageTheme.link, textDecoration: "underline" }}
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
