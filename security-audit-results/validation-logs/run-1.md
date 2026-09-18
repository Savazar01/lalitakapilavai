# Adversarial Validation Log: Run 1

- **Validator Agent**: Cloudflare Adversarial Reviewer
- **Target**: `Savazar01/lalitakapilavai`
- **Date**: 2026-09-18

### Finding Validation Checks:
1. **VULN-003 (Vault Direct Access)**:
   - Attempted path: `GET /media/vault/masters/sample.jpg`.
   - Result: Code in `src/app/api/media/[...path]/route.ts` line 44 directly resolves `path.join(baseMediaDir, ...cleanSegments)` without preventing `vault` as first segment.
   - Verdict: **CONFIRMED EXPLOITABLE (CRITICAL)**.

2. **VULN-001 (Middleware Inactive)**:
   - Inspected root directory and `src/`: Found `src/proxy.ts` with no `middleware.ts`.
   - Result: Next.js standard build ignores `proxy.ts`.
   - Verdict: **CONFIRMED EXPLOITABLE (HIGH)**.

3. **VULN-002 (Open Mail Relay)**:
   - Checked `src/app/api/forms/submit/route.ts` line 63.
   - Result: `recipientEmails` from request JSON is split and used directly as `mailOptions.to`.
   - Verdict: **CONFIRMED EXPLOITABLE (HIGH)**.

4. **VULN-004 (Missing Security Headers)**:
   - Checked `next.config.ts`.
   - Result: No `headers()` function configured.
   - Verdict: **CONFIRMED (HIGH)**.

5. **VULN-005 (Missing Rate Limiting)**:
   - Checked `/api/events/register`, `/api/forms/submit`, `/api/leads/submit`.
   - Result: Endpoints execute directly without request rate tracking.
   - Verdict: **CONFIRMED EXPLOITABLE (HIGH)**.

6. **VULN-006 (Missing CORS/CSRF Origin Validation)**:
   - Checked mutating POST endpoints.
   - Result: No Origin or Referer verification.
   - Verdict: **CONFIRMED (MEDIUM)**.

7. **VULN-007 (Insecure TLS)**:
   - Checked `src/app/api/forms/submit/route.ts` line 96.
   - Result: `rejectUnauthorized: false` present.
   - Verdict: **CONFIRMED (MEDIUM)**.
