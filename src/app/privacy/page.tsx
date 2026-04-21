import { Container, Stack, Title, Text, List, ListItem, Paper, Box, Divider } from "@mantine/core";

const sectionTitleStyle = {
  color: "var(--about-text)",
  fontSize: "20px",
  fontWeight: "bold" as const,
  marginTop: "8px",
};

const subTitleStyle = {
  color: "var(--text-secondary)",
  fontSize: "17px",
  fontWeight: "bold" as const,
};

const bodyStyle = {
  color: "var(--about-text)",
  fontSize: "16px",
  lineHeight: "1.7",
};

const listStyle = {
  color: "var(--about-text)",
  fontSize: "16px",
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--about-page-bg)",
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
                color: "var(--about-text)",
                fontSize: "48px",
                fontWeight: 700,
                marginBottom: "10px",
                letterSpacing: "-0.5px",
              }}
            >
              Privacy Policy
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
              backgroundColor: "var(--about-container-bg)",
              border: "1px solid var(--border-color)",
              padding: "28px 32px",
            }}
          >
            <Stack gap="xl">

              {/* 1. Introduction */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>1. Introduction</Title>
                <Text style={bodyStyle}>
                  Welcome to LLNL STEM Games. We are committed to protecting your privacy and ensuring that your personal
                  information is handled in a safe and responsible manner.
                </Text>
                <Text style={bodyStyle}>
                  This Privacy Policy explains how we collect, use, store, and protect your information when you use our
                  website and services.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 2. Information We Collect */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>2. Information We Collect</Title>

                <Title order={3} style={subTitleStyle}>a. Account Information</Title>
                <Text style={bodyStyle}>When you create an account, we collect:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>Email address</ListItem>
                  <ListItem>Password — stored securely and encrypted</ListItem>
                </List>

                <Title order={3} style={subTitleStyle}>b. Gameplay Data</Title>
                <Text style={bodyStyle}>We collect information related to your activity on our platform, including:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>Game scores</ListItem>
                  <ListItem>Progress in levels</ListItem>
                  <ListItem>Achievements and statistics</ListItem>
                  <ListItem>In-game interactions and performance data</ListItem>
                </List>

                <Title order={3} style={subTitleStyle}>c. Automatically Collected Information</Title>
                <Text style={bodyStyle}>We may also collect:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>IP address</ListItem>
                  <ListItem>Browser type and device information</ListItem>
                  <ListItem>Mobile sensor data</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 3. How We Use Your Information */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>3. How We Use Your Information</Title>
                <Text style={bodyStyle}>We use your information to:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
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
                <Title order={2} style={sectionTitleStyle}>4. How We Store and Protect Your Information</Title>
                <Text style={bodyStyle}>We implement reasonable security measures to protect your data, including:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>Encryption of passwords</ListItem>
                  <ListItem>Secure databases and restricted access controls</ListItem>
                </List>
                <Text style={bodyStyle}>
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute
                  security.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 5. Sharing of Information */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>5. Sharing of Information</Title>
                <Text style={bodyStyle}>
                  We do <strong style={{ color: "var(--about-text)" }}>not sell your personal information</strong>.
                </Text>
                <Text style={bodyStyle}>We may share your data only in the following cases:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>With service providers who help operate our website (e.g., hosting services)</ListItem>
                  <ListItem>If required by law or legal process</ListItem>
                  <ListItem>To protect the rights, safety, and security of our users and platform</ListItem>
                </List>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 6. Data Retention */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>6. Data Retention</Title>
                <Text style={bodyStyle}>We retain your information as long as your account is active or as needed to:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>Provide our services</ListItem>
                  <ListItem>Comply with legal obligations</ListItem>
                  <ListItem>Resolve disputes and enforce agreements</ListItem>
                </List>
                <Text style={bodyStyle}>
                  You may request deletion of your account and associated data at any time.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 7. Your Rights and Choices */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>7. Your Rights and Choices</Title>
                <Text style={bodyStyle}>Depending on your location, you may have the right to:</Text>
                <List withPadding listStyleType="disc" style={listStyle}>
                  <ListItem>Access the personal data we hold about you</ListItem>
                  <ListItem>Request corrections to your information</ListItem>
                  <ListItem>Request deletion of your data</ListItem>
                  <ListItem>Opt out of certain communications</ListItem>
                </List>
                <Text style={bodyStyle}>To exercise these rights, contact us.</Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 8. Children's Privacy */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>8. Children&apos;s Privacy</Title>
                <Text style={bodyStyle}>
                  Our website is not intended for children under the age of 13. We do not knowingly collect personal
                  information from children without parental consent.
                </Text>
                <Text style={bodyStyle}>
                  If we become aware that such information has been collected, we will take steps to delete it.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              {/* 9. Contact Us */}
              <Stack gap="sm">
                <Title order={2} style={sectionTitleStyle}>9. Contact Us</Title>
                <Text style={bodyStyle}>
                  If you have any questions about this Privacy Policy, please visit our contact page.
                </Text>
              </Stack>

              <Divider color="var(--border-color)" />

              <Text style={{ ...bodyStyle, fontStyle: "italic", textAlign: "center" }}>
                By using LLNL STEM Games, you agree to this Privacy Policy.
              </Text>

            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
