# Skill: Cloudflare Edge Security, WAF & R2 Media Protection

## 1. Security Architecture Overview
The **Lalita Kapilavai** platform handles precious high-resolution intellectual property (scans of 22k gold leaf Tanjore paintings, private master recordings of Carnatic classical recitals) and public client interactions. Security is established through defense-in-depth across Cloudflare Edge, Next.js application headers, and R2 object storage policies.

---

## 2. Content Security Policy (CSP) Configuration
Implemented via Next.js Middleware or headers in `next.config.ts`:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.r2.dev https://media.lalitakapilavai.com https://*.s3.amazonaws.com;
  font-src 'self' data: https://fonts.gstatic.com;
  media-src 'self' blob: https://*.r2.cloudflarestorage.com https://media.lalitakapilavai.com;
  connect-src 'self' https://*.r2.cloudflarestorage.com https://challenges.cloudflare.com;
  frame-src 'self' https://challenges.cloudflare.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();
```

---

## 3. Cloudflare WAF & Edge Rate Limiting Rules

### Edge Rate Limiting Policies
| Route / Pattern | Rate Limit | Action | Rationale |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | 5 requests / minute per IP | Cloudflare Managed Challenge | Mitigates brute-force attacks against admin credentials |
| `/api/inquiry` | 3 requests / minute per IP | JS Challenge + Block | Prevents spam submission in commissioning and lead forms |
| `/api/media/watermark` | 60 requests / minute per IP | Rate Limit (Throttle 429) | Protects Sharp dynamic image transformation server from CPU starvation |
| `/*` (Global) | 300 requests / minute per IP | Log & Managed Challenge | DoS mitigation |

### WAF Managed Rulesets
- **Cloudflare OWASP Core Ruleset**: Paranoia Level 1 enabled with anomaly threshold set to medium.
- **Bot Fight Mode**: Enabled to block malicious automated scrapers from downloading the complete high-resolution artwork catalog.
- **Hotlink Protection**: Enabled on `media.lalitakapilavai.com` to prevent external websites from embedding direct high-res assets.

---

## 4. Cloudflare R2 Media Security & Storage Headers

### Bucket Access Policy
- **Public Read Access**: Strictly disabled on the root bucket.
- **Protected Master Assets**: Raw original scans (TIFF, lossless PNG, uncompressed audio WAV) are stored with prefix `masters/` and accessible **only** via authenticated server-side presigned URLs with maximum 15-minute expiration:
  ```typescript
  import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

  export async function getProtectedMasterUrl(key: string, adminUserId: string) {
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
  }
  ```

### HTTP Headers for Public Media Delivery
All public watermarked WebP/AVIF images and sample MP3 audio tracks served through Cloudflare CDN include:
```http
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: https://lalitakapilavai.com
Content-Disposition: inline
```

---

## 5. Deployment Hardening Checklist
- [x] HTTPS enforced with HSTS (`max-age=63072000; includeSubDomains; preload`).
- [x] TLS 1.3 minimum recommended version.
- [x] Cloudflare Turnstile CAPTCHA integrated on commission inquiry forms.
- [x] Presigned PUT URLs used for administrative artwork uploads to prevent passing large file payloads through the Next.js server.
