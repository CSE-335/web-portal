import { Container, Stack, Title, Text, List, ListItem, Paper, Box, Divider } from "@mantine/core";
import {
  staticInfoPageShell,
  staticInfoPageTitle,
  staticInfoCardSurface,
  staticInfoSectionTitle,
  staticInfoSubSectionTitle,
  staticInfoBody,
  staticInfoList,
  staticInfoCardPadding,
  staticInfoBlockGap,
} from "@/lib/theme/pageTheme";

const cardStyle = { ...staticInfoCardSurface, padding: staticInfoCardPadding };

export default function PrivacyPage() {
  return (
    <div style={staticInfoPageShell}>
      <Container size="lg">
        <Stack style={{ gap: staticInfoBlockGap }}>
          <Box>
            <Title order={1} style={staticInfoPageTitle}>
              Privacy Policy
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
            <Stack style={{ gap: staticInfoBlockGap }}>
              {/* 1. Introduction */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  1. Introduction
                </Title>
                <Text style={staticInfoBody}>
                  Welcome to LLNL STEM Games. We are committed to handling your information responsibly and being clear
                  about what data is used in this site.
                </Text>
                <Text style={staticInfoBody}>
                  This Privacy Policy explains what data we collect, how we use it, when we share it with service
                  providers, and what choices you have when you use our website and services.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 2. Information We Collect */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  2. Information We Collect
                </Title>

                <Title order={3} style={staticInfoSubSectionTitle}>
                  a. Account Information
                </Title>
                <Text style={staticInfoBody}>When you create an account, we collect:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Email address</ListItem>
                  <ListItem>Password credentials handled by our authentication provider (Supabase Auth)</ListItem>
                  <ListItem>Profile fields you choose to provide (for example display name, avatar URL, bio, locale)</ListItem>
                </List>

                <Title order={3} style={staticInfoSubSectionTitle}>
                  b. Gameplay Data
                </Title>
                <Text style={staticInfoBody}>We collect information related to your activity on our platform, including:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Per-game save data and progress state for signed-in users</ListItem>
                  <ListItem>In-app assistant conversation lines stored in browser session storage</ListItem>
                </List>

                <Title order={3} style={staticInfoSubSectionTitle}>
                  c. Automatically Collected Information
                </Title>
                <Text style={staticInfoBody}>We may also process technical information, such as:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>IP address used for security features like API rate limiting</ListItem>
                  <ListItem>Locale preference cookie for language selection</ListItem>
                  <ListItem>
                    Data you submit through forms (for example feedback name/email/comments and contact messages)
                  </ListItem>
                  <ListItem>
                    Optional audio/text content sent to AI or text-to-speech providers when you use assistant features
                  </ListItem>
                  <ListItem>Game-provided sensor or interaction data when a specific game requests it</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 3. How We Use Your Information */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  3. How We Use Your Information
                </Title>
                <Text style={staticInfoBody}>We use your information to:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Create and manage your account</ListItem>
                  <ListItem>Save your progress and game data</ListItem>
                  <ListItem>Provide in-game assistant and tutoring features</ListItem>
                  <ListItem>Operate, secure, and troubleshoot the platform</ListItem>
                  <ListItem>Respond to feedback, questions, and support requests</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 4. How We Store and Protect Your Information */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  4. How We Store and Protect Your Information
                </Title>
                <Text style={staticInfoBody}>
                  We implement reasonable security measures to protect data, including access controls and secure
                  infrastructure provided by our platform and cloud vendors.
                </Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Authentication and account management through Supabase Auth</ListItem>
                  <ListItem>Database-backed storage for account and gameplay records</ListItem>
                  <ListItem>Security headers and rate limiting on sensitive API routes</ListItem>
                </List>
                <Text style={staticInfoBody}>
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute
                  security.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 5. Sharing of Information */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  5. Sharing of Information
                </Title>
                <Text style={staticInfoBody}>
                  We do <strong style={{ color: "var(--about-text)" }}>not sell your personal information</strong>.
                </Text>
                <Text style={staticInfoBody}>We may share data with service providers that process information on our behalf:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Supabase (authentication and database services)</ListItem>
                  <ListItem>OpenAI and ElevenLabs (assistant and text-to-speech features, when used)</ListItem>
                  <ListItem>Resend (feedback email delivery)</ListItem>
                  <ListItem>Upstash (API rate limiting infrastructure)</ListItem>
                </List>
                <Text style={staticInfoBody}>We may also disclose information:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>If required by law or legal process</ListItem>
                  <ListItem>To protect the rights, safety, and security of our users and platform</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 6. Data Retention */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  6. Data Retention
                </Title>
                <Text style={staticInfoBody}>
                  We retain account and gameplay information while your account is active, and as needed to:
                </Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Provide our services</ListItem>
                  <ListItem>Comply with legal obligations</ListItem>
                  <ListItem>Resolve disputes and enforce agreements</ListItem>
                </List>
                <Text style={staticInfoBody}>
                  Browser session data (such as assistant conversation history stored in session storage) is controlled by
                  your browser and is typically cleared when the session ends.
                </Text>
                <Text style={staticInfoBody}>
                  You may request deletion of your account and associated platform data at any time.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 7. Your Rights and Choices */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  7. Your Rights and Choices
                </Title>
                <Text style={staticInfoBody}>Depending on your location, you may have the right to:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Access the personal data we hold about you</ListItem>
                  <ListItem>Request corrections to your information</ListItem>
                  <ListItem>Request deletion of your data</ListItem>
                  <ListItem>Opt out of certain communications</ListItem>
                </List>
                <Text style={staticInfoBody}>
                  You can also manage certain data directly in the product, such as deleting your account and changing your
                  locale preference.
                </Text>
                <Text style={staticInfoBody}>To exercise privacy rights requests, contact us.</Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 8. Children's Privacy */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  8. Children&apos;s Privacy
                </Title>
                <Text style={staticInfoBody}>
                  Some of our educational experiences may be used by students, but users under 13 should use the site with
                  parent/guardian or school supervision where required by applicable law.
                </Text>
                <Text style={staticInfoBody}>
                  We do not knowingly collect personal information from children in violation of applicable child privacy
                  laws. If you believe a child has provided personal information inappropriately, contact us and we will
                  review and remove it when appropriate.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 9. Contact Us */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  9. Contact Us
                </Title>
                <Text style={staticInfoBody}>
                  If you have questions about this Privacy Policy or want to submit a privacy request, please visit our
                  contact page.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              <Text style={{ ...staticInfoBody, fontStyle: "italic", textAlign: "center" }}>
                By using LLNL STEM Games, you agree to this Privacy Policy.
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
