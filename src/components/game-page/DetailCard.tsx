import { Paper, Text } from "@mantine/core";

type DetailCardProps = {
  label: string;
  value: string;
};

export default function DetailCard({ label, value }: DetailCardProps) {
  return (
    <Paper
      radius={20}
      p="md"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Text fz="xs" fw={600} tt="uppercase" lts="0.05em" c="rgba(255,255,255,0.5)">
        {label}
      </Text>
      <Text fz="md" fw={600} mt="sm">
        {value}
      </Text>
    </Paper>
  );
}
