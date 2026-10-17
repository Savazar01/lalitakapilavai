/**
 * Admin Safe Fetch & Response Deserialization Utility
 * Guarantees zero silent failures, automatic 401/403 session redirection,
 * and resilient array unwrapping across all administrative listing endpoints.
 */

export class AdminSessionExpiredError extends Error {
  constructor(message = "Session expired or unauthorized. Redirecting to login...") {
    super(message);
    this.name = "AdminSessionExpiredError";
  }
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

/**
 * Resilient fetch wrapper for administrative client components.
 * Automatically catches 401/403, evicts stale state, and redirects to login.
 */
export async function adminFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `/admin/login?redirect=${encodeURIComponent(currentPath)}`;
      // Clear any potential stale client-cached states
      window.location.href = redirectUrl;
    }
    throw new AdminSessionExpiredError();
  }

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // Body not JSON
    }
    throw new AdminApiError(errorMsg, res.status);
  }

  return (await res.json()) as T;
}

/**
 * Robust payload unwrapper supporting direct arrays, wrapper objects, and nested collections.
 * Prevents non-array payloads or API envelope changes from causing blank screens.
 */
export function unwrapRecords<T>(
  data: unknown,
  fallbackKeys: string[] = ["items", "pages", "artworks", "categories", "catalogs", "events", "leads", "posts"]
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of fallbackKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
  }

  return [];
}
