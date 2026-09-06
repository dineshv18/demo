export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  APP_NAME: "ORVANTA Financial",
  // Absolute origin, used for robots.txt / sitemap.xml.
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://orvantafinancial.com",
} as const;
