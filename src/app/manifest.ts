import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LLNL STEM Games",
    short_name: "STEM Games",
    description:
      "Educational STEM games from Lawrence Livermore National Laboratory",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#1d1c28",
    theme_color: "#23233a",
    icons: [
      {
        src: "/images/llnl-stem-logo.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
    ],
  };
}
