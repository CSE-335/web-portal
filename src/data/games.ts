// Auto-generated from game submodules — do not edit manually.
// Run ./scripts/setup-games.sh or node scripts/generate-games.js to regenerate.

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
  tags?: string[];
};

export const games: GameMeta[] = [
  {
    "slug": "BVoutbreak",
    "title": "Biology Virus Outbreak Simulator",
    "subject": "Science",
    "description": "Explore virus outbreaks and learn about epidemiological concepts through interactive modeling and AI-assisted feedback.",
    "longDescription": [
      "Biology Virus Outbreak Simulator is an interactive science game where students explore how virus outbreaks spread and evolve. By answering questions, players can observe the impact of different factors on the progression of an epidemic.",
      "The game introduces concepts such as infection dynamics, immunity, and public health interventions through hands-on experimentation rather than passive memorization. Students can analyze the consequences of their decisions and adjust their strategies accordingly.",
      "AI-assisted feedback gives players insights into the effectiveness of their interventions, helping them understand the complex interplay of factors that influence virus transmission and control. This interactive approach fosters critical thinking and a deeper understanding of epidemiological concepts."
    ],
    "iframeSrc": "/staticGames/BVoutbreak/index.html",
    "thumbnailSrc": "/gameThumbnails/BVoutbreak.png",
    "embedHeight": "100vh",
    "featured": true,
    "tags": [
      "biology",
      "virus",
      "epidemiology",
      "ai",
      "simulation"
    ]
  },
  {
    "slug": "human-motion",
    "title": "Human Motion Simulator",
    "subject": "Science",
    "description": "Stream accelerometer data from your phone to simulate human motion in a real-time desktop visualization.",
    "longDescription": [
      "Human Motion Simulator is an interactive science game that connects your mobile phone's accelerometer to a desktop simulation. By moving your phone, you control a virtual figure in real-time, exploring how acceleration, velocity, and position relate to physical movement.",
      "The app uses Firebase for real-time data streaming between your phone and desktop, with a Kaplay-powered visualization that renders the motion on screen. Students can experiment with different movements and observe how sensor data translates to simulated motion.",
      "This hands-on approach makes abstract physics concepts like inertia, acceleration, and force tangible by letting students see the direct connection between their physical movements and the resulting simulation data."
    ],
    "iframeSrc": "/staticGames/human-motion/index.html",
    "thumbnailSrc": "/gameThumbnails/human-motion.png",
    "embedHeight": "100vh",
    "featured": true,
    "tags": [
      "physics",
      "motion",
      "accelerometer",
      "simulation",
      "mobile"
    ]
  },
  {
    "slug": "pythongame",
    "title": "Python Programming Game",
    "subject": "Technology",
    "description": "Learn Python by writing code to guide a robot through maze puzzles and interactive coding challenges.",
    "longDescription": [
      "Python Programming Game (working title) is an educational coding game where students learn Python by solving interactive puzzles. Starting with simple print statements and progressing to maze navigation, players write real code that executes step-by-step with visual playback.",
      "Each level introduces new programming concepts through hands-on challenges. A built-in code editor with line-by-line playback lets students see exactly how their code runs, making abstract concepts like loops, functions, and conditionals tangible and immediate.",
      "Advanced levels feature a virtual robot navigating procedurally generated mazes. Students write Python modules that control the robot's movement and sensor readings, bridging the gap between writing code and seeing it interact with a simulated environment."
    ],
    "iframeSrc": "/staticGames/pythongame/index.html",
    "thumbnailSrc": "/gameThumbnails/pythongame.png",
    "embedHeight": "100vh",
    "featured": true,
    "tags": [
      "python",
      "coding",
      "maze",
      "robotics",
      "algorithms"
    ]
  }
];

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
