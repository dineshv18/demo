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

    // Receiving UPI for QR-based deposits (INR)
    ORVANTA_UPI_ID: process.env.ORVANTA_UPI_ID || "rforritesh@pingpay",

    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

    // USD Payment Details (placeholder — update when ready)
    ORVANTA_USD_PAYMENT_METHOD: process.env.ORVANTA_USD_PAYMENT_METHOD || "Bank Transfer",
    ORVANTA_USD_ACCOUNT_NAME: process.env.ORVANTA_USD_ACCOUNT_NAME || "ORVANTA Financial",
    ORVANTA_USD_ACCOUNT_NUMBER: process.env.ORVANTA_USD_ACCOUNT_NUMBER || "XXXXXXXXXXXX",
    ORVANTA_USD_ROUTING_NUMBER: process.env.ORVANTA_USD_ROUTING_NUMBER || "XXXXXXXXX",
    ORVANTA_USD_SWIFT_CODE: process.env.ORVANTA_USD_SWIFT_CODE || "XXXXXXXX",
    ORVANTA_USD_BANK_NAME: process.env.ORVANTA_USD_BANK_NAME || "Your Bank Name",

    CORS_ORIGINS: [
      process.env.ADMIN_URL || "http://localhost:5173",
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.USER_URL || "http://localhost:3001",
    ],
  };
}

export default getEnv;
