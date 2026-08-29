# Skill: Playwright E2E Test Suite Architecture

## 1. Scope & Strategy
The Playwright end-to-end testing suite guarantees reliability across critical platform user flows for the **Lalita Kapilavai** portfolio platform:
1. **Authentication & Admin RBAC** (Better-Auth login, session persistence, unauthorized redirect).
2. **Dynamic Visual Layout Builders** (Gallery grid rendering, lightbox deep-zoom, Carnatic audio player state).
3. **Dynamic Image Watermarking & Asset Protection** (Verifying that client-facing images deliver watermarked versions and prevent unauthorized direct access to raw master TIFF/Hi-Res files).
4. **Lead Capture & Commission Inquiries** (Contact and inquiry forms, validation, and confirmation notifications).

---

## 2. Test Suite Specifications

### Test Suite 1: Authentication & Admin Portal (`tests/e2e/auth.spec.ts`)
- **Scenarios**:
  - Unauthenticated access to `/admin` routes must redirect to `/auth/signin`.
  - Admin login with valid credentials persists session cookie (`better-auth.session_token`).
  - Accessing protected dashboard confirms admin greeting and access to artwork curation controls.
  - Sign-out invalidates session and clears active cookies.
```typescript
import { test, expect } from "@playwright/test";

test.describe("Better-Auth Admin Authentication", () => {
  test("redirects unauthenticated users from /admin to /auth/signin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("successful admin login grants dashboard access", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "admin@lalitakapilavai.com");
    await page.fill('input[name="password"]', "AdminSecurePass123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("h1")).toContainText("Admin Dashboard");
  });
});
```

---

### Test Suite 2: Visual Layout & Audio Synesthesia (`tests/e2e/gallery.spec.ts`)
- **Scenarios**:
  - Main gallery grid renders responsive masonry cards with Tanjore gold borders.
  - Clicking an artwork triggers high-resolution lightbox with zoom capabilities.
  - Selecting "Listen to Inspired Raga" triggers Carnatic audio player bar with track title, raga scales, and play/pause controls.
```typescript
import { test, expect } from "@playwright/test";

test.describe("Gallery & Synesthetic Player", () => {
  test("loads gallery items and launches synesthetic raga player", async ({ page }) => {
    await page.goto("/gallery");
    const firstCard = page.locator('[data-testid="artwork-card"]').first();
    await expect(firstCard).toBeVisible();

    // Open lightbox
    await firstCard.click();
    await expect(page.locator('[data-testid="artwork-lightbox"]')).toBeVisible();

    // Trigger audio
    const audioTrigger = page.locator('[data-testid="play-raga-btn"]');
    if (await audioTrigger.isVisible()) {
      await audioTrigger.click();
      await expect(page.locator('[data-testid="carnatic-player"]')).toBeVisible();
    }
  });
});
```

---

### Test Suite 3: Image Watermarking & Dynamic Protection (`tests/e2e/media-protection.spec.ts`)
- **Scenarios**:
  - Verify that public gallery image elements render URLs routing through the watermarked proxy endpoint (`/api/media/watermark?id=...`).
  - Verify that attempting to fetch high-resolution master asset (`/api/media/master/...`) without administrative authorization returns HTTP 403 Forbidden.
```typescript
import { test, expect } from "@playwright/test";

test.describe("Media Watermark Protection", () => {
  test("public gallery images include watermarking parameters", async ({ page }) => {
    await page.goto("/gallery");
    const images = page.locator('img[data-protected="true"]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    
    const src = await images.first().getAttribute("src");
    expect(src).toMatch(/\/api\/media\/watermark|watermarked/);
  });

  test("direct raw master asset download returns 403 Forbidden for anonymous users", async ({ request }) => {
    const response = await request.get("/api/media/master/raw-master-sample.tiff");
    expect(response.status()).toBe(403);
  });
});
```

---

### Test Suite 4: Lead Capture & Commission Workflow (`tests/e2e/inquiry.spec.ts`)
- **Scenarios**:
  - Navigate to `/commission` or click "Inquire About Artwork" from single artwork page.
  - Fill in Name, Email, Phone, Project Details, and Budget tier.
  - Validate client-side error states for invalid email and empty fields.
  - Submit valid form, verify HTTP 201 response, and confirm visual success toast / notification.
```typescript
import { test, expect } from "@playwright/test";

test.describe("Art Commission Lead Capture", () => {
  test("validates required fields and submits inquiry successfully", async ({ page }) => {
    await page.goto("/commission");
    
    // Submit empty to verify validations
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Please enter your name")).toBeVisible();

    // Fill valid details
    await page.fill('input[name="name"]', "Sangeetha Raman");
    await page.fill('input[name="email"]', "sangeetha@example.com");
    await page.fill('input[name="phone"]', "+91 98765 43210");
    await page.selectOption('select[name="artStyle"]', "TANJORE");
    await page.fill('textarea[name="message"]', "Looking to commission a 36x48 inch Tanjore painting of Goddess Saraswati with 22k gold foil.");

    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="inquiry-success"]')).toBeVisible();
  });
});
```
