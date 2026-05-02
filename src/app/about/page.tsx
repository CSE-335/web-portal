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
    roles: ["Full-Stack", "Database Designer"],
    image: "/teampics/natalie.png",
  },
  {
    name: "Sergio Gonzalez",
    roles: ["Back-end", "Database Designer", "UI/UX"],
    image: "/teampics/sergio.png",
  },
  {
    name: "Ethan Reed",
    roles: ["Team Lead/Coordinator", "Full-Stack"],
    image: "/teampics/ethan.png",
  },
];

export default function AboutPage() {
  return (
    <div
      style={{
        ...pageTheme.shell,
        paddingTop: "clamp(24px, 6vw, 40px)",
        paddingBottom: "clamp(40px, 8vw, 60px)",
        paddingLeft: "clamp(12px, 4vw, 16px)",
        paddingRight: "clamp(12px, 4vw, 16px)",
      }}
    >
      <Container size="lg" px={0}>
        <Stack gap="xl">
          <Box>
            <Title
              order={1}
              style={{
                ...pageTheme.title,
                marginBottom: "8px",
                fontSize: "clamp(1.75rem, 5vw + 0.5rem, 3.5rem)",
                lineHeight: 1.15,
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
            p={{ base: "md", sm: "lg", md: "xl" }}
            style={{
              ...pageTheme.card,
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  ...pageTheme.sectionTitle,
                  fontSize: "clamp(17px, 2.5vw, 20px)",
                }}
              >
                Project Overview
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "clamp(15px, 1.5vw + 0.65rem, 18px)",
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
                fontSize: "clamp(1.125rem, 2vw + 0.75rem, 1.625rem)",
                fontWeight: 500,
                lineHeight: 1.25,
              }}
            >
              Meet the Team
            </Text>

            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 5 }}
              spacing={{ base: "md", sm: "lg" }}
              verticalSpacing={{ base: "md", sm: "lg" }}
            >
              {teamMembers.map((member) => (
                <Paper
                  key={member.name}
                  shadow="none"
                  radius={0}
                  p={{ base: "md", sm: "lg" }}
                  style={{
                    ...pageTheme.card,
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
                      sizes="(max-width: 768px) 96px, 110px"
                      style={{
                        width: "clamp(96px, 28vw, 110px)",
                        height: "clamp(96px, 28vw, 110px)",
                        maxWidth: "100%",
                        objectFit: "cover",
                        border: "2px solid var(--card-border)",
                        marginBottom: "16px",
                        backgroundColor: "var(--card-img-bg)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "clamp(96px, 28vw, 110px)",
                        height: "clamp(96px, 28vw, 110px)",
                        backgroundColor: "var(--card-img-bg)",
                        border: "2px solid var(--card-border)",
                        marginBottom: "16px",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Text
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "clamp(16px, 2.5vw, 18px)",
                      fontWeight: 500,
                      marginBottom: "12px",
                      wordBreak: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {member.name}
                  </Text>

                  <Stack gap={2} align="center" style={{ maxWidth: "100%" }}>
                    {member.roles.map((role) => (
                      <Text
                        key={role}
                        style={{
                          color: "var(--text-body)",
                          fontSize: "clamp(14px, 2vw, 16px)",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                          paddingInline: "4px",
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
            p={{ base: "md", sm: "lg", md: "xl" }}
            style={{
              ...pageTheme.card,
            }}
          >
            <Stack gap="sm">
              <Text
                style={{
                  ...pageTheme.sectionTitle,
                  fontSize: "clamp(17px, 2.5vw, 20px)",
                }}
              >
                Client Company
              </Text>

              <Text
                style={{
                  ...pageTheme.body,
                  fontSize: "clamp(15px, 1.5vw + 0.65rem, 18px)",
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