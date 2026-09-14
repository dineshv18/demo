function getEnv() {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || "development",

    BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    BREVO_SMTP_PORT: Number(process.env.BREVO_SMTP_PORT) || 587,
    BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
    BREVO_SMTP_PASS: process.env.BREVO_SMTP_PASS,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "ORVANTA Financial",

    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || "",
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "",

    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

    // Receiving crypto addresses for USDT deposits.
    ORVANTA_USDT_TRC20_ADDRESS: process.env.ORVANTA_USDT_TRC20_ADDRESS || "TXdsbHJQhyzinGzsEVZ7a8a4uzXtKoACwd",
    ORVANTA_USDT_BEP20_ADDRESS: process.env.ORVANTA_USDT_BEP20_ADDRESS || "0xeA029DF5F5cA71C7922fFC5a3cc464e3b272F1C0",

    CORS_ORIGINS: [
      process.env.ADMIN_URL || "http://localhost:5173",
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.USER_URL || "http://localhost:3001",
    ],
  };
}

export default getEnv;
