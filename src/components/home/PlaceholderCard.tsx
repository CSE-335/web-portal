const CARD_GRADIENT =
  "linear-gradient(90deg, #2A2F4E 0%, #2A305B 12.98%, #222748 100%)";

type PlaceholderCardProps = {
  className?: string;
};

export default function PlaceholderCard({
  className = "",
}: PlaceholderCardProps) {
  return (
    <div
      className={`w-full rounded-[20px] ${className}`}
      style={{ background: CARD_GRADIENT }}
    />
  );
}
