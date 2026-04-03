'use client';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { Button, Group } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

type BottomButtonsProps = {
  random?: boolean;
};

export default function BottomButtons({ random }: BottomButtonsProps) {
  const t = useTranslations('common');
  return (
    <Group justify="center" gap="md" mt={48} px="md">
      {random != false &&
        <Button
          size="lg"
          color="#525B86"
          className="btn-theme"
          miw={178}
        >
          <span className="flex items-center gap-3">
            <Image src="/images/shuffle.svg" alt="shuffle" width={28} height={28} aria-hidden className="shrink-0" />
            {t('randomGame')}
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
          <Image src="/images/arrow.svg" alt="up arrow" width={18} height={18} aria-hidden className="shrink-0" />
          {t('backToTop')}
        </span>
      </Button>
    </Group>
  );
}
