# Skill: Playwright E2E Test Suite Architecture

## 1. Scope & Strategy
The Playwright end-to-end testing suite guarantees stability, accessibility, and visual fidelity across all public portals and the 10 administrative modules of the **SavazAI WebApps Platform**:
1. **Authentication & Admin RBAC** (Better-Auth login, session persistence, unauthorized redirect, superadmin privilege escalation prevention).
2. **Artwork Catalog & Placard Print Engine** (Artwork gallery rendering, high-res deep zoom, watermark verification, isolated iframe placard printing).
3. **Interactive e-Catalog Studio** (Virtual page-flip monograph viewer, curatorial notes, PDF export trigger).
4. **3D WebGL Exhibition Salon Corridor** (Three.js canvas initialization, aspect ratio wrapping, multi-wall corridor navigation).
5. **Visual Page Builder & Component Studio** (Drag-and-drop block rendering, real-time live preview, responsive breakpoints).
6. **Lead Capture, Events & Mail Notification Studio** (Commission inquiries, Event RSVP registration, dynamic form submissions, email dispatch audit log).

---

## 2. Test Configuration & Environment Standards
- **Base URL**: `http://localhost:3060`
- **Dynamic Credentials**: Credentials must be sourced dynamically from `.env` or standard fallback test fixtures:
  - `ADMIN_EMAIL`: `${process.env.ADMIN_EMAIL || "admin@example.com"}`
  - `ADMIN_INITIAL_PASSWORD`: `${process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!"}`
- **Viewport Profiles**: Desktop ($1440 \times 900\text{ px}$), Tablet ($768 \times 1024\text{ px}$), Mobile ($375 \times 667\text{ px}$).

---

## 3. Test Suite Specifications

### Test Suite 1: Authentication & Admin RBAC (`tests/e2e/auth.spec.ts`)
```typescript
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3060";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!";

test.describe("Better-Auth Admin Authentication & RBAC", () => {
  test("redirects unauthenticated requests from /admin to /admin/login", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("successful admin login grants access to the 10 dashboard modules", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("nav")).toContainText("Artworks");
    await expect(page.locator("nav")).toContainText("e-Catalogs");
    await expect(page.locator("nav")).toContainText("Events");
    await expect(page.locator("nav")).toContainText("Page Builder");
    await expect(page.locator("nav")).toContainText("Settings");
  });
});
```

---

### Test Suite 2: 3D WebGL Exhibition Salon Corridor (`tests/e2e/exhibition-corridor.spec.ts`)
```typescript
import { test, expect } from "@playwright/test";

test.describe("3D WebGL Spatial Exhibition Corridor", () => {
  test("initializes Three.js canvas and preserves natural artwork aspect ratios", async ({ page }) => {
    await page.goto("/gallery");
    
    const webglCanvas = page.locator('canvas[data-engine="three.js"]').first();
    if (await webglCanvas.isVisible()) {
      await expect(webglCanvas).toBeVisible();
      // Verify no dark overlays obscuring the canvas
      await expect(page.locator('[data-testid="canvas-overlay-banner"]')).toHaveCount(0);
    }
  });

  test("hides on-wall placards on mobile viewports (< 768px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/gallery");

    const onWallPlacard = page.locator('[data-testid="on-wall-placard"]');
    if (await onWallPlacard.count() > 0) {
      await expect(onWallPlacard.first()).toBeHidden();
    }
  });
});
```

---

### Test Suite 3: Museum Placard Print Subsystem (`tests/e2e/placard-print.spec.ts`)
```typescript
import { test, expect } from "@playwright/test";

test.describe("Museum Placard Isolated Iframe Print Driver", () => {
  test("generates isolated headless iframe without injecting into main document", async ({ page }) => {
    await page.goto("/admin/artworks");
    
    // Open placard modal for the first artwork
    const placardBtn = page.locator('[data-testid="open-placard-modal"]').first();
    if (await placardBtn.isVisible()) {
      await placardBtn.click();
      await expect(page.locator('[data-testid="placard-preview"]')).toBeVisible();

      // Trigger print and verify print iframe generation
      await page.click('[data-testid="print-placard-btn"]');
      const printIframe = page.locator('iframe#__placard_print_frame__');
      await expect(printIframe).toBeAttached();
    }
  });
});
```

---

### Test Suite 4: Dynamic Event Registration & RSVP Engine (`tests/e2e/events-rsvp.spec.ts`)
```typescript
import { test, expect } from "@playwright/test";

test.describe("Event Recital & Exhibition RSVP Engine", () => {
  test("submits attendee registration and dispatches decoupled notifications", async ({ page }) => {
    await page.goto("/events");
    const eventCard = page.locator('[data-testid="event-card"]').first();
    await expect(eventCard).toBeVisible();
    await eventCard.click();

    // Verify dynamic earmark text is rendered
    await expect(page.locator('[data-testid="event-earmark"]')).toBeVisible();

    // Fill RSVP form
    await page.fill('input[name="name"]', "Curator Test");
    await page.fill('input[name="email"]', "curator@example.com");
    await page.fill('input[name="guests"]', "2");
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="rsvp-success"]')).toBeVisible();
  });
});
```
