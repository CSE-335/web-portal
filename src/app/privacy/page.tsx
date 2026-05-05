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
                  Welcome to LLNL STEM Games. We are committed to protecting your privacy and ensuring that your personal
                  information is handled in a safe and responsible manner.
                </Text>
                <Text style={staticInfoBody}>
                  This Privacy Policy explains how we collect, use, store, and protect your information when you use our
                  website and services.
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
                  <ListItem>Password — stored securely and encrypted</ListItem>
                </List>

                <Title order={3} style={staticInfoSubSectionTitle}>
                  b. Gameplay Data
                </Title>
                <Text style={staticInfoBody}>We collect information related to your activity on our platform, including:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Game scores</ListItem>
                  <ListItem>Progress in levels</ListItem>
                  <ListItem>Achievements and statistics</ListItem>
                  <ListItem>In-game interactions and performance data</ListItem>
                </List>

                <Title order={3} style={staticInfoSubSectionTitle}>
                  c. Automatically Collected Information
                </Title>
                <Text style={staticInfoBody}>We may also collect:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>IP address</ListItem>
                  <ListItem>Browser type and device information</ListItem>
                  <ListItem>Mobile sensor data</ListItem>
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
                  <ListItem>Provide personalized gameplay experiences</ListItem>
                  <ListItem>Improve our games and platform performance</ListItem>
                  <ListItem>Monitor and prevent cheating, abuse, or unauthorized access</ListItem>
                  <ListItem>Communicate with you about updates, changes, or support requests</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 4. How We Store and Protect Your Information */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  4. How We Store and Protect Your Information
                </Title>
                <Text style={staticInfoBody}>We implement reasonable security measures to protect your data, including:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Encryption of passwords</ListItem>
                  <ListItem>Secure databases and restricted access controls</ListItem>
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
                <Text style={staticInfoBody}>We may share your data only in the following cases:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>With service providers who help operate our website (e.g., hosting services)</ListItem>
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
                <Text style={staticInfoBody}>We retain your information as long as your account is active or as needed to:</Text>
                <List withPadding listStyleType="disc" style={staticInfoList}>
                  <ListItem>Provide our services</ListItem>
                  <ListItem>Comply with legal obligations</ListItem>
                  <ListItem>Resolve disputes and enforce agreements</ListItem>
                </List>
                <Text style={staticInfoBody}>
                  You may request deletion of your account and associated data at any time.
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
                <Text style={staticInfoBody}>To exercise these rights, contact us.</Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 8. Children's Privacy */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  8. Children&apos;s Privacy
                </Title>
                <Text style={staticInfoBody}>
                  Our website is not intended for children under the age of 13. We do not knowingly collect personal
                  information from children without parental consent.
                </Text>
                <Text style={staticInfoBody}>
                  If we become aware that such information has been collected, we will take steps to delete it.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 9. Contact Us */}
              <Stack gap="sm">
                <Title order={2} style={staticInfoSectionTitle}>
                  9. Contact Us
                </Title>
                <Text style={staticInfoBody}>
                  If you have any questions about this Privacy Policy, please visit our contact page.
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
