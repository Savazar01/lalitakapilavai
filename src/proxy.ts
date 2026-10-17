import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Better-Auth session cookie resolution
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const sessionDataCookie =
    request.cookies.get("better-auth.session_data")?.value ||
    request.cookies.get("__Secure-better-auth.session_data")?.value;

  let isSessionExpired = false;
  if (sessionDataCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionDataCookie, "base64").toString("utf-8"));
      if (decoded && decoded.expiresAt) {
        const expiresMs =
          typeof decoded.expiresAt === "number" && decoded.expiresAt < 10000000000
            ? decoded.expiresAt * 1000
            : new Date(decoded.expiresAt).getTime();
        if (Number.isFinite(expiresMs) && Date.now() > expiresMs) {
          isSessionExpired = true;
        }
      }
    } catch {
      // Non-blocking parse fallback
    }
  }

  const hasActiveSession = Boolean(sessionToken && !isSessionExpired);

  // 2. Defense-in-depth edge guard for /api/admin/:path*
  if (pathname.startsWith("/api/admin")) {
    if (!hasActiveSession) {
      const res = NextResponse.json(
        { error: "Unauthorized administrative access. Valid session required." },
        { status: 401 }
      );
      res.cookies.delete("better-auth.session_token");
      res.cookies.delete("__Secure-better-auth.session_token");
      res.cookies.delete("better-auth.session_data");
      res.cookies.delete("__Secure-better-auth.session_data");
      return res;
    }
  }

  // 3. UI Route guard for /admin/:path*
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    // Unauthenticated or expired session attempting to access protected admin page
    if (!hasActiveSession && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("better-auth.session_token");
      res.cookies.delete("__Secure-better-auth.session_token");
      res.cookies.delete("better-auth.session_data");
      res.cookies.delete("__Secure-better-auth.session_data");
      return res;
    }

    // On login page: if user arrived via redirect query parameter or has stale session, explicitly clear cookies and render login form
    if (isLoginPage) {
      if (request.nextUrl.searchParams.has("redirect") || !hasActiveSession) {
        const res = NextResponse.next();
        res.cookies.delete("better-auth.session_token");
        res.cookies.delete("__Secure-better-auth.session_token");
        res.cookies.delete("better-auth.session_data");
        res.cookies.delete("__Secure-better-auth.session_data");
        return res;
      }
      return NextResponse.next();
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
        if (originUrl.host !== host && !originUrl.host.endsWith("savazar.com")) {
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
        if (refererUrl.host !== host && !refererUrl.host.endsWith("savazar.com")) {
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
