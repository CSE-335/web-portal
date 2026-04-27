import { Container, Stack, Title, Text, Paper, SimpleGrid, Box } from "@mantine/core";
import Image from "next/image";
import { pageTheme } from "@/lib/theme/pageTheme";

const teamMembers = [
  {
    name: "Arielle Talania",
    roles: ["Creator of Laurie-chan & Livvy-chan", "Full Stack", "DevOps", "UI/UX"],
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
    roles: ["Back-end", "Database Designer", "UI/UX"],
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
        ...pageTheme.shell,
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <Box>
            <Title
              order={1}
              style={{
                ...pageTheme.title,
                fontSize: "56px",
                marginBottom: "8px",
              }}
            >
              About Us
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
            shadow="none"
            radius={0}
            p="xl"
            style={{
              ...pageTheme.card,
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  ...pageTheme.sectionTitle,
                  fontSize: "20px",
                }}
              >
                Project Overview
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "18px",
                }}
              >
                Welcome to LLNL STEM Games! Explore short, interactive mini-games that turn core STEM ideas
                into hands-on challenges you can play right in your browser. Each
                activity is designed to help you build real understanding through
                experimentation, problem-solving, and guided reflection. Some
                games use real-world inputs like device sensors, and many include
                an AI tutor that can offer Socratic hints and scaffolding when
                you’re stuck. Our goal is to make STEM learning engaging and
                accessible, while staying grounded in accurate science and
                engineering principles.
              </Text>
            </Stack>
          </Paper>

          <Stack gap="md">
            <Text
              style={{
                ...pageTheme.title,
                fontSize: "26px",
                fontWeight: 500,
              }}
            >
              Meet the Team
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="lg">
              {teamMembers.map((member) => (
                <Paper
                  key={member.name}
                  shadow="none"
                  radius={0}
                  p="lg"
                  style={{
                    ...pageTheme.card,
                    minHeight: "340px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={110}
                      height={110}
                      style={{
                        width: "110px",
                        height: "110px",
                        objectFit: "cover",
                        border: "2px solid var(--card-border)",
                        marginBottom: "20px",
                        backgroundColor: "var(--card-img-bg)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "110px",
                        height: "110px",
                        backgroundColor: "var(--card-img-bg)",
                        border: "2px solid var(--card-border)",
                        marginBottom: "20px",
                      }}
                    />
                  )}

                  <Text
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "18px",
                      fontWeight: 500,
                      marginBottom: "14px",
                    }}
                  >
                    {member.name}
                  </Text>

                  <Stack gap={2} align="center">
                    {member.roles.map((role) => (
                      <Text
                        key={role}
                        style={{
                          color: "var(--text-body)",
                          fontSize: "16px",
                          lineHeight: 1.4,
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
            shadow="none"
            radius={0}
            p="xl"
            style={{
              ...pageTheme.card,
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  ...pageTheme.sectionTitle,
                  fontSize: "20px",
                }}
              >
                Client Company
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "18px",
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