/**
 * Client-side origin resolver using window.location.origin with zero hardcoding.
 * Safe for direct import in Client Components ("use client").
 */
export function getClientBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "";
}
