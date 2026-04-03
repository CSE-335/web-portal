export type GameMeta = {
  slug: string;
  title: string;
  subject: "Science" | "Technology" | "Engineering" | "Mathematics";
  description: string;
  longDescription: string[];
  iframeSrc: string;
  thumbnailSrc: string;
  embedHeight?: string;
  featured?: boolean;
};

export const games: GameMeta[] = [
  {
    slug: "matrix-meadow",
    title: "Matrix Meadow Academy",
    subject: "Science",
    description:
      "Practice matrix multiplication through interactive monster scaling challenges and AI-assisted feedback.",
    longDescription: [
      "Matrix Meadow Academy turns matrix multiplication into a visual monster-scaling challenge where students learn by transforming creatures directly on screen. Instead of solving problems in isolation, players apply matrices to match target shapes, making abstract linear algebra feel more concrete and intuitive.",
      "The game focuses on core ideas like scaling transformations, matrix structure, and the relationship between numerical input and visual output. By tying each problem to an immediate visual result, students can better understand how matrix multiplication changes size and form rather than treating it as pure symbol manipulation.",
      "AI-assisted feedback supports the learning process by helping players understand why a transformation worked or failed, reinforcing pattern recognition and encouraging correction through guided practice.",
    ],
    iframeSrc: "https://atalania.github.io/Matrix-Meadow-Academy/",
    thumbnailSrc: "/images/matrix-meadow-thumb.png",
    embedHeight: "575px",
    featured: true,
  },
  {
    slug: "sonic-fingerprint-lab",
    title: "Sonic Fingerprint Lab",
    subject: "Science",
    description:
      "Explore audio patterns, frequencies, and voice-based analysis through an interactive sound lab.",
    longDescription: [
      "Sonic Fingerprint Lab is an interactive science game where students explore how sound can be visualized, compared, and analyzed through frequency-based patterns. By using their own voice and recorded signals, players engage directly with the idea that every sound leaves behind a measurable acoustic signature.",
      "The game introduces concepts such as pitch, waveform behavior, and frequency differences through hands-on experimentation rather than passive memorization. Students can observe how changes in sound input affect the resulting patterns, helping them build intuition for audio analysis in a more immediate and engaging way.",
      "AI-assisted feedback helps interpret the player’s results, point out meaningful differences in their sound data, and guide them toward a stronger understanding of how frequency patterns relate to vocal and acoustic characteristics.",
    ],
    iframeSrc: "https://atalania.github.io/SonicLab/",
    thumbnailSrc: "/images/sonic-fingerprint-thumb.png",
    embedHeight: "575px",
    featured: true,
  },
    {
    slug: "biology-virus-outbreak-simulator",
    title: "Biology Virus Outbreak Simulator",
    subject: "Science",
    description:
      "Explore virus outbreaks and learn about epidemiological concepts through interactive modeling and AI-assisted feedback.",
    longDescription: [
      "Biology Virus Outbreak Simulator is an interactive science game where students explore how virus outbreaks spread and evolve. By answering questions, players can observe the impact of different factors on the progression of an epidemic.",
      "The game introduces concepts such as infection dynamics, immunity, and public health interventions through hands-on experimentation rather than passive memorization. Students can analyze the consequences of their decisions and adjust their strategies accordingly.",
      "AI-assisted feedback gives players insights into the effectiveness of their interventions, helping them understand the complex interplay of factors that influence virus transmission and control. This interactive approach fosters critical thinking and a deeper understanding of epidemiological concepts.",
    ],
    iframeSrc: "https://biology-virus-ai-game-g18s.onrender.com/",
    thumbnailSrc: "/images/biology-virus-outbreak-simulator.png",
    embedHeight: "575px",
    featured: true,
  },
];
  export function getGameBySlug(slug: string) {
    return games.find((game) => game.slug === slug);
  }
