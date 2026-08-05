import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma;

function getPrisma() {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return prisma;
}

export default getPrisma;
