import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import StemSection from "@/components/home/alt/StemSection";
import BottomButtons from "@/components/layout/BottomButtons";


export default function AltHomePage() {
  return (
    <main>
      <WelcomeBanner />

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
