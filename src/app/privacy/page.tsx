import { Container, Stack, Title, Text, List, ListItem } from "@mantine/core";


const sectionTitleStyle = {
  color: "white",
  fontSize: "22px",
  fontWeight: "bold" as const,
  marginTop: "8px",
};

const subTitleStyle = {
  color: "#D1D5DB",
  fontSize: "17px",
  fontWeight: "bold" as const,
};

const bodyStyle = {
  color: "#9CA3AF",
  fontSize: "16px",
  lineHeight: "1.7",
};

const listStyle = {
  color: "#9CA3AF",
  fontSize: "16px",
};

const dividerStyle = {
  borderColor: "#4B5563",
  margin: "8px 0",
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#3C4579", minHeight: "100vh", paddingTop: "40px", paddingBottom: "60px" }}>
      <Container size="md">
        <Stack gap="xl">
          <Title order={1} style={{ color: "white", fontSize: "32px", fontWeight: "bold", textAlign: "center" }}>
            Privacy Policy
          </Title>

          <hr style={dividerStyle} />

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

          <hr style={dividerStyle} />

          {/* 2. Information We Collect */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>2. Information We Collect</Title>

            <Title order={3} style={subTitleStyle}>a. Account Information</Title>
            <Text style={bodyStyle}>When you create an account, we collect:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Email address</ListItem>
              <ListItem>Password — stored securely and encrypted</ListItem>
            </List>

            <Title order={3} style={subTitleStyle}>b. Gameplay Data</Title>
            <Text style={bodyStyle}>We collect information related to your activity on our platform, including:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Game scores</ListItem>
              <ListItem>Progress in levels</ListItem>
              <ListItem>Achievements and statistics</ListItem>
              <ListItem>In-game interactions and performance data</ListItem>
            </List>

            <Title order={3} style={subTitleStyle}>c. Automatically Collected Information</Title>
            <Text style={bodyStyle}>We may also collect:</Text>
            <List withPadding style={listStyle}>
              <ListItem>IP address</ListItem>
              <ListItem>Browser type and device information</ListItem>
              <ListItem>Mobile sensor data</ListItem>
            </List>
          </Stack>

          <hr style={dividerStyle} />

          {/* 3. How We Use Your Information */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>3. How We Use Your Information</Title>
            <Text style={bodyStyle}>We use your information to:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Create and manage your account</ListItem>
              <ListItem>Save your progress and game data</ListItem>
              <ListItem>Provide personalized gameplay experiences</ListItem>
              <ListItem>Improve our games and platform performance</ListItem>
              <ListItem>Monitor and prevent cheating, abuse, or unauthorized access</ListItem>
              <ListItem>Communicate with you about updates, changes, or support requests</ListItem>
            </List>
          </Stack>

          <hr style={dividerStyle} />

          {/* 4. How We Store and Protect Your Information */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>4. How We Store and Protect Your Information</Title>
            <Text style={bodyStyle}>We implement reasonable security measures to protect your data, including:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Encryption of passwords</ListItem>
              <ListItem>Secure databases and restricted access controls</ListItem>
            </List>
            <Text style={bodyStyle}>
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute
              security.
            </Text>
          </Stack>

          <hr style={dividerStyle} />

          {/* 5. Sharing of Information */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>5. Sharing of Information</Title>
            <Text style={bodyStyle}>
              We do <strong style={{ color: "#D1D5DB" }}>not sell your personal information</strong>.
            </Text>
            <Text style={bodyStyle}>We may share your data only in the following cases:</Text>
            <List withPadding style={listStyle}>
              <ListItem>With service providers who help operate our website (e.g., hosting services)</ListItem>
              <ListItem>If required by law or legal process</ListItem>
              <ListItem>To protect the rights, safety, and security of our users and platform</ListItem>
            </List>
          </Stack>

          <hr style={dividerStyle} />

          {/* 6. Data Retention */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>6. Data Retention</Title>
            <Text style={bodyStyle}>We retain your information as long as your account is active or as needed to:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Provide our services</ListItem>
              <ListItem>Comply with legal obligations</ListItem>
              <ListItem>Resolve disputes and enforce agreements</ListItem>
            </List>
            <Text style={bodyStyle}>
              You may request deletion of your account and associated data at any time.
            </Text>
          </Stack>

          <hr style={dividerStyle} />

          {/* 7. Your Rights and Choices */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>7. Your Rights and Choices</Title>
            <Text style={bodyStyle}>Depending on your location, you may have the right to:</Text>
            <List withPadding style={listStyle}>
              <ListItem>Access the personal data we hold about you</ListItem>
              <ListItem>Request corrections to your information</ListItem>
              <ListItem>Request deletion of your data</ListItem>
              <ListItem>Opt out of certain communications</ListItem>
            </List>
            <Text style={bodyStyle}>To exercise these rights, contact us.</Text>
          </Stack>

          <hr style={dividerStyle} />

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

          <hr style={dividerStyle} />

          {/* 10. Contact Us */}
          <Stack gap="sm">
            <Title order={2} style={sectionTitleStyle}>10. Contact Us</Title>
            <Text style={bodyStyle}>
              If you have any questions about this Privacy Policy, please visit our contact page.
            </Text>
          </Stack>

          <hr style={dividerStyle} />

          <Text style={{ ...bodyStyle, fontStyle: "italic", textAlign: "center" }}>
            By using LLNL STEM Games, you agree to this Privacy Policy.
          </Text>
        </Stack>
      </Container>
    </div>
  );
}
