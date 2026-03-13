import GameCard from "../GameCard";
import PlaceholderCard from "../PlaceholderCard";
import { GameMeta } from "@/data/games";

type GameSlotProps = {
  game?: GameMeta;
  heightClass: string;
};

export default function GameSlot({ game, heightClass }: GameSlotProps) {
  if (!game) return <PlaceholderCard className={heightClass} />;

  return (
    <GameCard
      title={game.title}
      description={game.description}
      href={`/games/${game.slug}`}
      imageSrc={game.thumbnailSrc}
      className={heightClass}
    />
  );
}
