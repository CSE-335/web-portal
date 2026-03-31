import { Flex } from "@mantine/core";
import ToolbarInfo from "./toolbar/ToolbarInfo";
import ToolbarButtons from "./toolbar/ToolbarButtons";

type GameToolbarProps = {
  slug: string;
  title: string;
  subject: string;
  iframeSrc: string;
};

export default function GameToolbar({
  slug,
  title,
  subject,
  iframeSrc,
}: GameToolbarProps) {
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
      <ToolbarButtons slug={slug} iframeSrc={iframeSrc} />
    </Flex>
  );
}
