import { Button, Group } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

type BottomButtonsProps = {
  random?: boolean;
};

export default function BottomButtons({ random }: BottomButtonsProps) {
  return (
    <Group justify="center" gap="md" mt={48} px="md">
      {/*hide the random button if false is passed in*/}
      {random != false &&
        <Button
          size="lg"
          radius="xl"
          fw={700}
          color="#525B86"
          miw={178}
        >
          Random Game
        </Button>
      }


      <Button
        component="a"
        href="#top"
        size="lg"
        radius="xl"
        fw={700}
        miw={185}
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        ↑ Back to the top
      </Button>
    </Group>
  );
}
