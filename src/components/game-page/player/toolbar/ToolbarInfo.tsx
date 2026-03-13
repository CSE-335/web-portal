import Image from "next/image";
import { Group, Box, Title, Text } from "@mantine/core";

type ToolbarInfoProps = {
  title: string;
  subject: string;
};

export default function ToolbarInfo({ title, subject }: ToolbarInfoProps) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Image
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games logo"
        width={42}
        height={42}
        className="h-auto w-9"
      />
      <Box>
        <Title order={1} fz={{ base: "xl", md: "h3" }}>
          {title}
        </Title>
        <Text fz="sm" c="rgba(255,255,255,0.7)">
          {subject}
        </Text>
      </Box>
    </Group>
  );
}
