import Image from "next/image";
import Link from "next/link";

const CARD_GRADIENT =
  "linear-gradient(90deg, #2A2F4E 0%, #2A305B 12.98%, #222748 100%)";

type GameCardProps = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  className?: string;
};

export default function GameCard({
  title,
  description,
  href,
  imageSrc,
  className = "",
}: GameCardProps) {
  return (
    <Link
      href={href}
      className={`group relative block h-[210px] w-full overflow-hidden rounded-[20px] border border-white/10 md:h-[260px] ${className}`}
      style={{ background: CARD_GRADIENT }}
    >
      <Image
        src={imageSrc}
        alt={title}
        width={640}
        height={360}
        sizes="(min-width: 768px) 640px, 100vw"
        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-90"
      />

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent p-4">
        <h3 className="text-lg font-extrabold text-white md:text-xl">
          {title}
        </h3>
        <p className="mt-1 text-sm text-white/85">{description}</p>
      </div>
    </Link>
  );
}
