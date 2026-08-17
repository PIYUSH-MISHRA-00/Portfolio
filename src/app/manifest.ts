import type { MetadataRoute } from "next";
import { identity } from "@/lib/profile";

/**
 * Makes the site installable, so it opens chromeless like an app on phone,
 * tablet and desktop. `start_url` must carry the basePath.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${identity.name} — Portfolio`,
    short_name: "P. Mishra",
    description: "Public engineering work, grouped by role and generated from live GitHub data.",
    start_url: "/Portfolio/",
    scope: "/Portfolio/",
    display: "standalone",
    orientation: "any",
    background_color: "#07080a",
    theme_color: "#07080a",
    // A single scalable icon covers every density; no PNG ladder to keep in sync.
    icons: [{ src: "/Portfolio/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
