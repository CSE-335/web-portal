export type GameMeta = {
    slug: string;
    title: string;
    subject: "Science" | "Technology" | "Engineering" | "Mathematics";
    description: string;
    iframeSrc: string;
    thumbnailSrc: string;
    embedHeight?: string;
    featured?: boolean;
  };
  
  export const games: GameMeta[] = [
    {
      slug: "matrix-meadow",
      title: "Matrix Meadow Academy",
      subject: "Mathematics",
      description:
        "Practice matrix multiplication through interactive monster scaling challenges and AI-assisted feedback.",
      iframeSrc: "https://atalania.github.io/Matrix-Meadow-Academy/",
      thumbnailSrc: "/images/matrix-meadow-thumb.png",
      embedHeight: "800px",
      featured: true,
    },
    {
      slug: "sonic-fingerprint-lab",
      title: "Sonic Fingerprint Lab",
      subject: "Science",
      description:
        "Explore audio patterns, frequencies, and voice-based analysis through an interactive sound lab.",
      iframeSrc: "https://atalania.github.io/SonicLab/",
      thumbnailSrc: "/images/sonic-fingerprint-thumb.png",
      embedHeight: "800px",
      featured: true,
    },
  ];
  
  export function getGameBySlug(slug: string) {
    return games.find((game) => game.slug === slug);
  }