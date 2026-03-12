type GameDescriptionProps = {
  longDescription: string[];
};

export default function GameDescription({
  longDescription,
}: GameDescriptionProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#273267]/92 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
      <h2 className="text-2xl font-extrabold">Game Description</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-white/82">
        {longDescription.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
