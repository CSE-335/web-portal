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
        background: "var(--detail-card-bg)",
        border: "1px solid var(--detail-card-border)",
      }}
    >
      <Text fz="xs" fw={600} tt="uppercase" lts="0.05em" c="var(--detail-label)">
        {label}
      </Text>
      <Text fz="md" fw={600} mt="sm" c="var(--text-primary)">
        {value}
      </Text>
    </Paper>
  );
}
