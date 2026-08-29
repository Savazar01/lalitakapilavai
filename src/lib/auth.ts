import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3060",
  secret: process.env.BETTER_AUTH_SECRET || "dev-insecure-secret-key-at-least-32-chars-long",
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Strictly disable public self-registration
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ADMIN",
        input: false, // Prevent user role tampering
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
