import SaveProgressBanner from "./SaveProgressBanner";
import GameEmbed from "./GameEmbed";
import GameToolbar from "./GameToolbar";

type GamePlayerProps = {
  title: string;
  subject: string;
  iframeSrc: string;
  embedHeight?: string;
};

export default function GamePlayer({
  title,
  subject,
  iframeSrc,
  embedHeight = "760px",
}: GamePlayerProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#22263F]/95 shadow-[0_18px_45px_rgba(0,0,0,0.30)]">
      <SaveProgressBanner />

      <div className="p-3">
        <div className="overflow-hidden bg-[linear-gradient(180deg,#2A2F56_0%,#202542_100%)]">
          <GameEmbed src={iframeSrc} title={title} height={embedHeight} />
        </div>
      </div>

      <GameToolbar title={title} subject={subject} iframeSrc={iframeSrc} />
    </section>
  );
}
