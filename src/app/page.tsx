import { Stack } from "@mantine/core";
import HeroBanner from "@/components/home/HeroBanner";
import StemSection from "@/components/home/StemSection";
import BottomButtons from "@/components/home/BottomButtons";

export default function HomePage() {
  return (
    <main>
      <HeroBanner />

      <Stack gap={0}>
        <StemSection subject="Science" />
        <StemSection subject="Technology" titlePosition="right" />
        <StemSection subject="Engineering" />
        <StemSection subject="Mathematics" titlePosition="right" />
      </Stack>

      <BottomButtons />
    </main>
  );
}
