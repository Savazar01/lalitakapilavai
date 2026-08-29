# Skill: Better-Auth Enterprise Best Practices (Private Admin Architecture)

## 1. Core Principles
The **Lalita Kapilavai** platform uses **Better-Auth** exclusively as a private, high-security administration and content management system.
- **Public Registrations Disabled**: `emailAndPassword.disableSignUp: true` is strictly enforced.
- **Role-Based Access Control (RBAC)**: Supports roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
- **Cryptographic Rigor**: High-entropy session tokens, HTTPS-only secure cookies in production, and timing-safe comparisons.

---

## 2. Server Configuration (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3060",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Strictly disables public self-registration
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,            // 5 minutes cookie cache
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ADMIN",
        input: false,             // Prevents client-supplied role escalation
      },
    },
  },
});
```

---

## 3. Next.js Route Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

---

## 4. Route Guarding Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    
    // Better-auth session token cookie
    const sessionToken = 
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    // Unauthenticated user attempting to access protected admin pages
    if (!sessionToken && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated user attempting to access login page
    if (sessionToken && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 5. Superadmin Account Provisioning via Seed Script
Since public registrations are disabled, accounts are provisioned via administrative CLI or seed scripts (`prisma/seed.ts`).
- Secure scrypt / bcrypt password hashing.
- Initial role assignment set to `SUPER_ADMIN`.
