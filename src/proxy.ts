import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Better-Auth session cookie resolution
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // 2. Defense-in-depth edge guard for /api/admin/:path*
  if (pathname.startsWith("/api/admin")) {
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized administrative access. Valid session cookie required." },
        { status: 401 }
      );
    }
  }

  // 3. UI Route guard for /admin/:path*
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    // Unauthenticated user attempting to access protected admin page
    if (!sessionToken && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated user attempting to visit login page -> redirect to dashboard
    if (sessionToken && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 4. CSRF / Origin Verification for state-mutating requests (POST, PUT, PATCH, DELETE)
  const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutatingMethod && (pathname.startsWith("/api/") || pathname.startsWith("/admin/"))) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host && !originUrl.host.endsWith("lalitakapilavai.com") && !originUrl.host.endsWith("savazar.com")) {
          return NextResponse.json(
            { error: "Cross-Origin Request Blocked" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid Origin header" },
          { status: 400 }
        );
      }
    } else if (referer && host) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host && !refererUrl.host.endsWith("lalitakapilavai.com") && !refererUrl.host.endsWith("savazar.com")) {
          return NextResponse.json(
            { error: "Cross-Origin Referer Blocked" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid Referer header" },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/forms/:path*",
    "/api/leads/:path*",
    "/api/events/:path*",
  ],
};
