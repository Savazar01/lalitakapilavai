# Skill: Cloudflare Edge Security, WAF & R2 Media Vault Protection

## 1. Security Architecture Overview
The **SavazAI WebApps Platform** safeguards enterprise cultural archives, high-resolution master plates (TIFF/lossless artwork scans, multi-track audio recordings), and collector CRM interactions. Security is established through defense-in-depth across Cloudflare Edge WAF, Next.js application security headers, and Cloudflare R2 / AWS S3 private origin protection.

---

## 2. Content Security Policy (CSP) Directives
Configured to seamlessly support Three.js WebGL blobs, inline CID email previews, and private R2 signed asset deliveries:

```typescript
export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: cid: https://*.r2.cloudflarestorage.com https://*.r2.dev https://*.s3.amazonaws.com https://media.* https://*.savazar.com;
  font-src 'self' data: https://fonts.gstatic.com;
  media-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.s3.amazonaws.com;
  connect-src 'self' https: wss: https://*.r2.cloudflarestorage.com https://challenges.cloudflare.com;
  frame-src 'self' https://challenges.cloudflare.com;
  frame-ancestors 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();
```

---

## 3. Cloudflare WAF & Edge Rate Limiting Policies

### Edge Rate Limiting Policies
| Route / Pattern | Rate Limit | Action | Rationale |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | 5 requests / min per IP | Cloudflare Managed Challenge | Thwarts credential stuffing against Better-Auth admin endpoints |
| `/api/forms/submit` | 3 requests / min per IP | JS Challenge + Block | Prevents spam in Page Builder dynamic forms |
| `/api/events/register` | 5 requests / min per IP | Rate Limit (429) | Prevents denial-of-wallet / ticket RSVP flooding |
| `/api/admin/media/*` | 60 requests / min per IP | Rate Limit (429) | Protects Sharp dynamic image transformation server from CPU exhaustion |
| `/*` (Global) | 300 requests / min per IP | Log & Managed Challenge | Edge DoS mitigation |

### WAF Managed Rulesets
- **Cloudflare OWASP Core Ruleset**: Paranoia Level 1 with medium anomaly score threshold.
- **Bot Fight Mode**: Prevents automated scraping of full high-resolution artwork archives.
- **Hotlink Protection**: Restricts raw media origins from external direct hotlinking.

---

## 4. Multi-Tenant Media Vault & Storage Headers

### Bucket Access Policy
- **Root Public Read Access**: Strictly disabled on the root bucket (`savazai-media-vault`).
- **Protected Master Assets**: Raw master scans and uncompressed audio are stored with prefix `masters/` and accessible **only** via authenticated server-side presigned URLs with a 15-minute TTL:
  ```typescript
  import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

  export async function getProtectedMasterUrl(key: string, adminUserId: string) {
    const s3 = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || "savazai-media-vault",
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
  }
  ```

### HTTP Headers for Public Media Delivery
All public watermarked WebP/AVIF assets served via CDN or the local fallback route include:
```http
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Content-Disposition: inline
```

---

## 5. Deployment Hardening Checklist
- [x] HTTPS enforced with HSTS (`max-age=63072000; includeSubDomains; preload`).
- [x] TLS 1.3 minimum recommended protocol.
- [x] Cloudflare Turnstile CAPTCHA integrated on public submission forms.
- [x] Presigned PUT URLs utilized for heavy artwork uploads, bypassing Next.js server payload bottlenecks.
