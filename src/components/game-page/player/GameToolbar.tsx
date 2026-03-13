import { Flex } from "@mantine/core";
import ToolbarInfo from "./toolbar/ToolbarInfo";
import ToolbarButtons from "./toolbar/ToolbarButtons";

type GameToolbarProps = {
  title: string;
  subject: string;
  iframeSrc: string;
};

export default function GameToolbar({
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
        borderTop: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(67, 75, 127, 0.9)",
      }}
    >
      <ToolbarInfo title={title} subject={subject} />
      <ToolbarButtons iframeSrc={iframeSrc} />
    </Flex>
  );
}
