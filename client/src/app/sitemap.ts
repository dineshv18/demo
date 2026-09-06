import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Public marketing routes only — authenticated areas are deliberately absent. */
const PUBLIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/platform", priority: 0.8 },
  { path: "/contact", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((r) => ({
    url: `${env.SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
