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
      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/20 shadow-lg">
        <iframe
          src={src}
          title={title}
          className="w-full border-0"
          style={{ height }}
          allowFullScreen
        />
      </div>
    );
  }