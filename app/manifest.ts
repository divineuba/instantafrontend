import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Instanta",
    short_name: "Instanta",
    description:
      "Instanta Group runs Instanta Logistics and Instanta Travels from one account, one workspace, one platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#714b67",
    icons: [
      {
        src: "/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
