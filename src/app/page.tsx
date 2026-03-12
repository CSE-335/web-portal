import { Stack } from "@mantine/core";
import HeroBanner from "@/components/home/HeroBanner";
import StemSection from "@/components/home/StemSection";
import BottomButtons from "@/components/home/BottomButtons";
import { PAGE_BACKGROUND_GRADIENT } from "@/constants/layout";

export default function HomePage() {
  return (
    <main
      id="top"
      className="flex min-h-screen flex-col pb-10"
      style={{ background: PAGE_BACKGROUND_GRADIENT }}
    >
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
