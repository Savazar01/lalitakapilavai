import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding-window store
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries periodically every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const expiryCutoff = now - windowMs;
  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => ts > expiryCutoff);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  // Cloudflare Connecting IP is highest priority and cannot be spoofed behind Cloudflare Proxy
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // X-Forwarded-For may contain a comma-separated list of proxies: client, proxy1, proxy2
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export interface RateLimitOptions {
  limit?: number; // max allowed requests within window
  windowMs?: number; // window size in milliseconds
  identifier?: string; // custom route namespace
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks sliding window rate limit for an incoming request.
 * Default: 10 requests per 60 seconds per IP.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60 * 1000;
  const namespace = options.identifier ?? "global";

  const ip = getClientIp(req);
  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  cleanupExpired(windowMs);

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = oldest ? oldest + windowMs - now : windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil(resetMs / 1000)),
    };
  }

  // Record request
  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}
