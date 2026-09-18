# Security Audit: Detailed Vulnerability Traces & Exploitation Proofs

---

### VULN-003: Unauthenticated Direct Access to Master Vault Assets
- **Severity**: CRITICAL
- **Category**: Access Control / Information Disclosure
- **CWE**: CWE-200, CWE-552
- **Location**: `src/app/api/media/[...path]/route.ts:40-64`
- **Root Cause**: The dynamic catch-all route `/api/media/[...path]` constructs candidate paths by joining `baseMediaDir` (`public/media`) with `cleanSegments`. Because the master unwatermarked art files reside in `public/media/vault/`, a request to `/media/vault/...` resolved to the actual raw master file on disk.
- **Attack Scenario**: An attacker sends `GET /media/vault/masters/asset-id.jpg`. The server reads the file without checking session credentials and returns HTTP 200 with the raw unwatermarked high-resolution scan.
- **Remediation**:
  1. Forbid any path whose first segment is `"vault"` with HTTP 403 Forbidden.
  2. Verify resolved canonical path with `path.resolve()` and ensure it does not start with `public/media/vault`.

---

### VULN-001: Inactive Edge Middleware Due to Misnamed File
- **Severity**: HIGH
- **Category**: Access Control
- **CWE**: CWE-306, CWE-693
- **Location**: `src/proxy.ts`
- **Root Cause**: Next.js App Router exclusively loads middleware from `middleware.ts` or `src/middleware.ts`. The repository contained `src/proxy.ts`, which was never invoked by the Next.js runtime.
- **Attack Scenario**: Unauthenticated visitors making direct requests to `/admin` or `/admin/*` were not intercepted at the edge.
- **Remediation**: Implement `src/middleware.ts` with route matcher `["/admin/:path*", "/api/admin/:path*"]`, redirecting unauthenticated users to `/admin/login` and blocking unauthenticated API mutations with HTTP 401.

---

### VULN-002: Arbitrary Email Relay via Client-Supplied Recipient Parameter
- **Severity**: HIGH
- **Category**: Feature Abuse / Email Injection
- **CWE**: CWE-640, CWE-943
- **Location**: `src/app/api/forms/submit/route.ts:63-77`
- **Root Cause**: The route accepted `recipientEmails` from the incoming JSON body and split it into addresses passed directly into Nodemailer's `to` field.
- **Attack Scenario**: A malicious user sends `POST /api/forms/submit` with `recipientEmails: "victim@external.com"`, utilizing the atelier's authenticated SMTP server to dispatch arbitrary spam messages.
- **Remediation**: Remove client-controlled recipient overriding. Submissions must always be delivered to the verified administrative alert email (`settings.adminAlertEmail` or default system contact).

---

### VULN-004: Missing Enterprise HTTP Security Headers
- **Severity**: HIGH
- **Category**: Security Misconfiguration
- **CWE**: CWE-693, CWE-1021
- **Location**: `next.config.ts`
- **Root Cause**: `next.config.ts` lacked a `headers()` definition.
- **Remediation**: Inject HSTS, strict CSP compatible with Cloudflare Turnstile, R2/S3, and Google Fonts, along with X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.

---

### VULN-005: Absence of Rate Limiting on Inbound Endpoints
- **Severity**: HIGH
- **Category**: Business Logic / Denial of Service
- **CWE**: CWE-770
- **Location**: `/api/events/register`, `/api/forms/submit`, `/api/leads/submit`
- **Root Cause**: No request throttling mechanism existed on public submission endpoints.
- **Remediation**: Implement a resilient IP-based sliding window rate limiter in `src/lib/rate-limit.ts` reading Cloudflare's `cf-connecting-ip` / `x-forwarded-for`.

---

### VULN-006: Missing Cross-Origin / CSRF Validation
- **Severity**: MEDIUM
- **Category**: Access Control
- **CWE**: CWE-352
- **Location**: `src/middleware.ts` & API routes
- **Remediation**: Enforce origin checking on mutating HTTP methods (`POST`, `PUT`, `DELETE`).

---

### VULN-007: Insecure TLS Certificate Verification in SMTP
- **Severity**: MEDIUM
- **Category**: Cryptography
- **CWE**: CWE-295
- **Location**: `src/app/api/forms/submit/route.ts:96`
- **Remediation**: Remove `rejectUnauthorized: false` to enforce valid upstream TLS certificate verification.
