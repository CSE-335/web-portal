import { TextInput } from "@mantine/core";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      placeholder="Search STEM games..."
      value={value}
      onChange={onChange}
      radius="xl"
      size="lg"
      rightSection={<img src="/images/search.svg" alt="" aria-hidden width={20} height={20} />}
      flex={1}
      maw={576}
      mx="auto"
      visibleFrom="md"
      styles={{
        input: {
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
        },
      }}
    />
  );
}
