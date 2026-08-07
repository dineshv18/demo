export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  APP_NAME: import.meta.env.VITE_APP_NAME || "ORVANTA Financial",
  APP_VERSION: "1.0.0",
} as const;
