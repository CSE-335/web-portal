import { Container, Stack, Title, Text } from "@mantine/core";

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#3C4579", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
      <Container size="lg">
        <Stack gap="xl">
          <Title
            order={1}
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Privacy Policy
          </Title>

          <Text
            style={{
              color: "#9CA3AF",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {/* Privacy policy content will go here */}
          </Text>
        </Stack>
      </Container>
    </div>
  );
}
