import { type RefObject } from "react";
import Link from "next/link";
import { Button, Flex, Group } from "@mantine/core";
import { useTranslations } from "next-intl";
import ToolbarInfo from "./toolbar/ToolbarInfo";
import ToolbarButtons from "./toolbar/ToolbarButtons";

type GameToolbarProps = {
  slug: string;
  title: string;
  subject: string;
  iframeSrc: string;
  embedRef: RefObject<HTMLDivElement | null>;
};

export default function GameToolbar({
  slug,
  title,
  subject,
  iframeSrc,
  embedRef,
}: GameToolbarProps) {
  const t = useTranslations("common");
  const returnLabel = t("returnToMain");

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ md: "center" }}
      justify={{ md: "space-between" }}
      gap="sm"
      px="md"
      py="sm"
      style={{
        borderTop: "1px solid var(--toolbar-border)",
        background: "var(--toolbar-bg)",
      }}
    >
      <ToolbarInfo title={title} subject={subject} />
      <Group gap="xs" wrap="wrap" justify="flex-end">
        <Button
          component={Link}
          href="/"
          variant="default"
          radius="xl"
          size="sm"
          title={returnLabel}
          styles={{
            root: {
              background: "var(--toolbar-btn-bg)",
              border: "1px solid var(--toolbar-btn-border)",
              color: "white",
            },
          }}
        >
          {returnLabel}
        </Button>
        <ToolbarButtons slug={slug} iframeSrc={iframeSrc} embedRef={embedRef} />
      </Group>
    </Flex>
  );
}
