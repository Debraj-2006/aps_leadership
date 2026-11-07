import type { MetadataRoute } from "next";

// Lets members install the hub on their phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IEEE AP-S IEM Leadership Hub",
    short_name: "AP-S Hub",
    description: "Events, tasks, points, announcements and more for the IEEE AP-S IEM Student Branch Chapter.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0b1d45",
    theme_color: "#0077c0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
