import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Only the public marketing pages should ever appear in search results.
 * Everything behind (or leading to) authentication — the dashboard, the auth
 * flows, and KYC — is disallowed here and additionally carries a `noindex`
 * robots meta tag from its own layout, so a crawler that ignores this file
 * still will not index those URLs.
 */
const PRIVATE_PATHS = [
  "/dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/kyc",
];

export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS.map((p) => `${p}/`).concat(PRIVATE_PATHS),
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
