import { Container, Stack, Title, Text, TextInput, Textarea, SimpleGrid, Radio, Group, Divider, Button } from "@mantine/core";

export default function FeedbackPage() {
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
        <form>
          <Stack gap="xl">
            <Stack gap="xs">
              <Title
                order={1}
                style={{
                  color: "#111827",
                  fontSize: "56px",
                  fontWeight: 500,
                }}
              >
                Website Feedback Form
              </Title>

              <Divider color="#4B5563" />
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <TextInput
                label={
                  <span style={{ color: "#111827", fontSize: "18px", fontWeight: 600 }}>
                    Name{" "}
                    <span style={{ color: "#6B7280", fontWeight: 400, marginLeft: "8px" }}>
                      optional
                    </span>
                  </span>
                }
                placeholder=""
                styles={{
                  label: {
                    marginBottom: 8,
                  },
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                    minHeight: "48px",
                  },
                }}
              />

              <TextInput
                label={
                  <span style={{ color: "#111827", fontSize: "18px", fontWeight: 600 }}>
                    Email{" "}
                    <span style={{ color: "#6B7280", fontWeight: 400, marginLeft: "8px" }}>
                      optional
                    </span>
                  </span>
                }
                placeholder=""
                styles={{
                  label: {
                    marginBottom: 8,
                  },
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                    minHeight: "48px",
                  },
                }}
              />
            </SimpleGrid>

            <Stack gap="xs">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                What problems or issues did you experience while using the website or
                playing the games?
              </Text>

              <Textarea
                minRows={8}
                autosize
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            <Stack gap="xs">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                What features or games would you like to see in the future?
              </Text>

              <Textarea
                minRows={8}
                autosize
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            <Stack gap="md">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                What is the likelihood that you will return to this site?
              </Text>

              <Radio.Group name="returnLikelihood">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Stack align="center" gap={8}>
                    <Radio
                      value="very-unlikely"
                      styles={{
                        radio: {
                          width: 28,
                          height: 28,
                          border: "2px solid #9CA3AF",
                          backgroundColor: "#F3F4F6",
                        },
                        body: { alignItems: "center" },
                        labelWrapper: { display: "none" },
                      }}
                    />
                    <Text style={{ color: "#111827", fontSize: "16px" }}>Very Unlikely</Text>
                  </Stack>

                  <Stack align="center" gap={8}>
                    <Radio
                      value="unlikely"
                      styles={{
                        radio: {
                          width: 28,
                          height: 28,
                          border: "2px solid #9CA3AF",
                          backgroundColor: "#F3F4F6",
                        },
                        body: { alignItems: "center" },
                        labelWrapper: { display: "none" },
                      }}
                    />
                    <Text style={{ color: "#111827", fontSize: "16px" }}>Unlikely</Text>
                  </Stack>

                  <Stack align="center" gap={8}>
                    <Radio
                      value="not-sure"
                      styles={{
                        radio: {
                          width: 28,
                          height: 28,
                          border: "2px solid #9CA3AF",
                          backgroundColor: "#F3F4F6",
                        },
                        body: { alignItems: "center" },
                        labelWrapper: { display: "none" },
                      }}
                    />
                    <Text style={{ color: "#111827", fontSize: "16px" }}>Not Sure</Text>
                  </Stack>

                  <Stack align="center" gap={8}>
                    <Radio
                      value="likely"
                      styles={{
                        radio: {
                          width: 28,
                          height: 28,
                          border: "2px solid #9CA3AF",
                          backgroundColor: "#F3F4F6",
                        },
                        body: { alignItems: "center" },
                        labelWrapper: { display: "none" },
                      }}
                    />
                    <Text style={{ color: "#111827", fontSize: "16px" }}>Likely</Text>
                  </Stack>

                  <Stack align="center" gap={8}>
                    <Radio
                      value="very-likely"
                      defaultChecked
                      styles={{
                        radio: {
                          width: 28,
                          height: 28,
                          border: "2px solid #9CA3AF",
                          backgroundColor: "#F3F4F6",
                        },
                        icon: {
                          width: 18,
                          height: 18,
                        },
                        body: { alignItems: "center" },
                        labelWrapper: { display: "none" },
                      }}
                    />
                    <Text style={{ color: "#111827", fontSize: "16px" }}>Very Likely</Text>
                  </Stack>
                </Group>
              </Radio.Group>
            </Stack>

            <Stack gap="xs">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "18px",
                }}
              >
                Please provide additional comments or questions.{" "}
                <span style={{ color: "#6B7280" }}>optional</span>
              </Text>

              <Textarea
                minRows={8}
                autosize
                styles={{
                  input: {
                    backgroundColor: "#F3F4F6",
                    border: "2px solid #6B7280",
                    color: "#111827",
                  },
                }}
              />
            </Stack>

            <Group justify="flex-end">
              <Button
                type="submit"
                style={{
                  backgroundColor: "#6B8FB3",
                  color: "white",
                  border: "1px solid #4B5563",
                }}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Container>
    </div>
  );
}