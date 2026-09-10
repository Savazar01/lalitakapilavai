import { headers } from "next/headers";
import { NextRequest } from "next/server";
export { getClientBaseUrl } from "./get-base-url-client";

function cleanHeaderValue(val: string | null | undefined): string | null {
  if (!val) return null;
  return val.split(",")[0].trim();
}

/**
 * Resolves the canonical base URL dynamically from runtime request context with zero hardcoding.
 * Evaluates in priority order:
 * 1. Explicitly provided NextRequest or standard Request (reverse-proxy headers or host)
 * 2. Next.js server runtime dynamic headers()
 * 3. Runtime environment variables (NEXT_PUBLIC_APP_URL or APP_URL)
 * 4. Empty string fallback (no static domain literals)
 */
export async function getServerBaseUrl(req?: NextRequest | Request): Promise<string> {
  // 1. Extract from explicitly provided NextRequest/Request
  if (req) {
    const rawForwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const forwardedHost = cleanHeaderValue(rawForwardedHost);
    const rawProto = req.headers.get("x-forwarded-proto") || req.headers.get("x-forwarded-protocol");
    const forwardedProto =
      cleanHeaderValue(rawProto) || (forwardedHost?.includes("localhost") ? "http" : "https");

    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/+$/, "");
    }
  }

  // 2. Extract from Next.js server runtime dynamic headers()
  try {
    const headerList = await headers();
    const rawForwardedHost = headerList.get("x-forwarded-host") || headerList.get("host");
    const host = cleanHeaderValue(rawForwardedHost);
    const rawProto = headerList.get("x-forwarded-proto") || headerList.get("x-forwarded-protocol");
    const proto = cleanHeaderValue(rawProto) || (host?.includes("localhost") ? "http" : "https");

    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, "");
    }
  } catch {
    // Graceful fallback when invoked outside App Router request context
  }

  // 3. Extract from runtime environment variables (if configured)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // 4. Default safety guard (strictly zero hardcoded domain strings)
  return "";
}
