import { Title, Flex, Stack, Box } from "@mantine/core";
import GameSlot from "./GameSlot";
import { SIDE_CARD_HEIGHT, MAIN_CARD_HEIGHT } from "@/constants/layout";
import { games, GameMeta } from "@/data/games";

type StemSectionProps = {
  subject: GameMeta["subject"];
  titlePosition?: "left" | "right";
};

export default function StemSection({
  subject,
  titlePosition = "left",
}: StemSectionProps) {
  const matchingGames = games.filter((g) => g.subject === subject);
  const [mainGame, sideGame] = matchingGames;

  return (
    <Box component="section" mt={{ base: 32, md: 40 }} px={{ base: "md", md: "lg" }}>
      <Flex
        direction={{
          base: "column",
          lg: titlePosition === "right" ? "row-reverse" : "row",
        }}
        gap={{ base: "md", lg: "lg" }}
      >
        <Stack gap="md" w={{ lg: "42%" }}>
          <Title
            order={2}
            fz={{ base: 36, md: 48 }}
          >
            {subject}
          </Title>
          <GameSlot game={sideGame} heightClass={SIDE_CARD_HEIGHT} />
        </Stack>

        <Box flex={{ lg: 1 }}>
          <GameSlot game={mainGame} heightClass={MAIN_CARD_HEIGHT} />
        </Box>
      </Flex>
    </Box>
  );
}
