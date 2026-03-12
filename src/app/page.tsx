import { Button, Group, Stack } from "@mantine/core";
import HeroBanner from "@/components/home/HeroBanner";
import GameCard from "@/components/home/GameCard";
import StemSection from "@/components/home/StemSection";
import { MAIN_CARD_HEIGHT } from "@/constants/layout";
import { games } from "@/data/games";

function GameCardFromSlug({ slug }: { slug: string }) {
  const game = games.find((g) => g.slug === slug);
  if (!game) return null;
  return (
    <GameCard
      title={game.title}
      description={game.description}
      href={`/games/${game.slug}`}
      imageSrc={game.thumbnailSrc}
      className={MAIN_CARD_HEIGHT}
    />
  );
}

export default function HomePage() {
  return (
    <div
      id="top"
      className="flex min-h-screen flex-col"
      style={{
        background:
          "linear-gradient(180deg, #1C1B26 0%, #282736 99.99%, #69658C 100%)",
      }}
    >
      <main className="flex-1 pb-10">
        <HeroBanner />

        <Group justify="center" mt="md" px="md">
          <Button
            component="a"
            href="/alt-home"
            radius="xl"
            color="#176BFF"
            fw={600}
          >
            View Alternate Homepage
          </Button>
        </Group>

        <Stack gap={0}>
          {/* Science */}
          <StemSection title="Science">
            <GameCardFromSlug slug="sonic-fingerprint-lab" />
          </StemSection>

          {/* BLANK for now */}
          <StemSection title="Technology" titlePosition="right" />
          <StemSection title="Engineering" />

          {/* Math */}
          <StemSection title="Mathematics" titlePosition="right">
            <GameCardFromSlug slug="matrix-meadow" />
          </StemSection>
        </Stack>

        <Group justify="center" gap="md" mt={48} px="md">
          <Button
            size="lg"
            radius="xl"
            fw={700}
            color="#525B86"
            miw={178}
          >
            Random Game
          </Button>

          <Button
            component="a"
            href="#top"
            size="lg"
            radius="xl"
            fw={700}
            miw={185}
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, #1B41FF 0%, #217AFF 14%, #0054F0 99.99%)",
            }}
          >
            ↑ Back to the top
          </Button>
        </Group>
      </main>
    </div>
  );
}
