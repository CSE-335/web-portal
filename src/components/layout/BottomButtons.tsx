import Image from "next/image";
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
          color="#525B86"
          miw={178}
        >
          <span className="flex items-center gap-3">
            <Image src="/images/shuffle.svg" alt="" width={28} height={28} aria-hidden className="shrink-0" />
            Random Game
          </span>
        </Button>
      }

      <Button
        component="a"
        href="#top"
        size="lg"
        miw={185}
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        <span className="flex items-center gap-3">
          <Image src="/images/arrow.svg" alt="" width={18} height={18} aria-hidden className="shrink-0" />
          Back to the top
        </span>
      </Button>
    </Group>
  );
}
