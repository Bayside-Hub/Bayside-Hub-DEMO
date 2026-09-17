import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bayside Hub",
    short_name: "Bayside Hub",
    description: "Bayside High School clubs, activities, events, and opportunities.",
    start_url: "/",
    display: "standalone",
    background_color: "#080d20",
    theme_color: "#263a99",
    orientation: "portrait-primary",
    icons: [
      { src: "/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/app-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
