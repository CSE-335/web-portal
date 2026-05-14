import { Container, Stack, Title, Text, Paper, SimpleGrid, Box } from "@mantine/core";
import Image from "next/image";
import {
  staticInfoPageShell,
  staticInfoPageTitle,
  staticInfoCardSurface,
  staticInfoSectionTitle,
  staticInfoBody,
  staticInfoCardPadding,
  staticInfoBlockGap,
} from "@/lib/theme/pageTheme";

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
    roles: ["Team Lead", "Full-Stack"],
    image: "/teampics/ethan.png",
  },
];

const cardStyle = { ...staticInfoCardSurface, padding: staticInfoCardPadding };

export default function AboutPage() {
  return (
    <div style={staticInfoPageShell}>
      <Container size="lg">
        <Stack style={{ gap: staticInfoBlockGap }}>
          <Box>
            <Title order={1} style={staticInfoPageTitle}>
              About Us
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
            <Stack gap="sm">
              <Text style={staticInfoSectionTitle}>Project Overview</Text>

              <Text style={staticInfoBody}>
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
                ...staticInfoSectionTitle,
                fontSize: "clamp(1.2rem, 2.8vw + 0.55rem, 1.625rem)",
              }}
            >
              Meet the Team
            </Text>

            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 5 }}
              style={{ gap: "clamp(0.75rem, 2.5vw, 1.5rem)" }}
            >
              {teamMembers.map((member) => (
                <Paper
                  key={member.name}
                  shadow="none"
                  radius="lg"
                  style={{
                    ...staticInfoCardSurface,
                    padding: "clamp(1rem, 2.2vw, 1.5rem)",
                    minHeight: "clamp(260px, 55vh, 340px)",
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
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "2px solid var(--about-border-strong)",
                        marginBottom: "20px",
                        backgroundColor: "var(--about-avatar-placeholder-bg)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "110px",
                        height: "110px",
                        backgroundColor: "var(--about-avatar-placeholder-bg)",
                        borderRadius: "12px",
                        border: "2px solid var(--about-border-strong)",
                        marginBottom: "20px",
                      }}
                    />
                  )}

                  <Text
                    style={{
                      color: "var(--about-text)",
                      fontSize: "clamp(1rem, 1.5vw + 0.75rem, 1.125rem)",
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
                          color: "var(--about-text)",
                          fontSize: "clamp(0.875rem, 1vw + 0.7rem, 1rem)",
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

          <Paper shadow="none" radius="lg" style={cardStyle}>
            <Stack gap="sm">
              <Text style={staticInfoSectionTitle}>Client Company</Text>

              <Text style={staticInfoBody}>
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
