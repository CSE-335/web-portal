type GameEmbedProps = {
  src: string;
  title: string;
  height?: string;
};

export default function GameEmbed({
  src,
  title,
  height = "800px",
}: GameEmbedProps) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-black/20">
      <iframe
        src={src}
        title={title}
        className="block w-full border-0"
        style={{ height }}
        allow="microphone; autoplay"
        allowFullScreen
      />
    </div>
  );
}