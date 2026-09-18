import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/build_fallback?schema=public";
  if (!url.includes("connect_timeout")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}connect_timeout=2`;
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
