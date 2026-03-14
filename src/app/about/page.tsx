import { Container, Stack, Title, Text, Paper, SimpleGrid, Box } from "@mantine/core";

const teamMembers = [
  {
    name: "Arielle Talania",
    roles: ["Full Stack", "DevOps", "UI/UX"],
    image: "/teampics/arielle.png",
  },
  {
    name: "Djeinabou Bah",
    roles: ["Team Moderator", "Front-End"],
    image: "/teampics/djeinabou.png",
  },
  {
    name: "Natalie Parker",
    roles: ["Team Lead", "Full-Stack", "Database Designer"],
    image: "/teampics/natalie.png",
  },
  {
    name: "Sergio Gonzalez",
    roles: ["Back-end", "Database Designer"],
    image: "/teampics/sergio.png",
  },
  {
    name: "Ethan Reed",
    roles: ["Team Coordinator", "Full-Stack"],
    image: "/teampics/ethan.png",
  },
];

export default function AboutPage() {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #2F356B 0%, #29315F 100%)",
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
                color: "white",
                fontSize: "48px",
                fontWeight: 700,
                marginBottom: "10px",
                letterSpacing: "-0.5px",
              }}
            >
              About Us
            </Title>

            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />
          </Box>

          <Paper
            shadow="sm"
            radius="md"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #D1D5DB",
              padding: "24px 28px",
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Project Overview
              </Text>

              <Text
                style={{
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: 1.8,
                }}
              >
                Welcome to Cool STEM Games! This is THE place to learn by doing.
                Explore short, interactive mini-games that turn core STEM ideas
                into hands-on challenges you can play right in your browser. Each
                activity is designed to help you build real understanding through
                experimentation, problem-solving, and guided reflection. Some
                games use real-world inputs like device sensors, and many include
                an AI tutor that can offer Socratic hints and scaffolding when
                you&apos;re stuck. Our goal is to make STEM learning engaging and
                accessible, while staying grounded in accurate science and
                engineering principles.
              </Text>
            </Stack>
          </Paper>

          <Stack gap="md">
            <Text
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              Meet the Team
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="lg">
              {teamMembers.map((member) => (
                <Paper
                  key={member.name}
                  shadow="sm"
                  radius="md"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #D1D5DB",
                    minHeight: "270px",
                    padding: "20px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #9CA3AF",
                        marginBottom: "14px",
                        backgroundColor: "#E5E7EB",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "10px",
                        backgroundColor: "#E5E7EB",
                        border: "1px solid #9CA3AF",
                        marginBottom: "14px",
                      }}
                    />
                  )}

                  <Text
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {member.name}
                  </Text>

                  <Stack gap={2} align="center">
                    {member.roles.map((role) => (
                      <Text
                        key={role}
                        style={{
                          color: "#4B5563",
                          fontSize: "14px",
                          lineHeight: 1.5,
                        }}
                      >
                        {role}
                      </Text>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>

          <Paper
            shadow="sm"
            radius="md"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #D1D5DB",
              padding: "24px 28px",
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Client Company
              </Text>

              <Text
                style={{
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: 1.8,
                }}
              >
                Lawrence Livermore National Laboratory (LLNL) is a federally
                funded research and development center known for cutting-edge
                work in national security, scientific computing, engineering, and
                applied research. LLNL supports a wide range of STEM education
                and outreach efforts, including projects that explore how
                interactive technology can improve learning and engagement. In
                partnership with our mentor, Dr. David Rakestraw, this capstone
                focuses on developing a scalable web platform and game
                experiences that demonstrate how AI and sensor-driven
                interactions can enhance STEM learning through guided inquiry and
                experimentation.
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}