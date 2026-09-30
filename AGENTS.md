<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Operational Context & Architecture: SavazAI WebApps Platform

## 1. Platform Vision & Multi-Tenant Atelier Architecture
- **Platform**: SavazAI WebApps (Engineered & Owned by Savazar).
- **Domain Scope**: Enterprise Multi-Tenant Digital Atelier, High-Fidelity Cultural Archive, 3D WebGL Exhibition Corridor, and Museum Publishing System.
- **Client & Domain Agnostic**:
  - The core platform engine is completely decoupled from any single artist, institution, or client identity.
  - Client branding (Name, Title, Subtitle, Bio, Disciplines, Domain Links, and Logos) is managed dynamically via database configuration (`SystemSetting`, `WhiteLabelConfig`, `ThemeConfig`).
  - Capable of servicing fine art masters, traditional heritage artists, museum collections, cultural performance archives, and private collector galleries.
- **Core Mission**:
  To deliver a museum-grade digital presentation engine that combines high-resolution artwork cataloging, physical gallery print automation (labels/placards), 3D spatial exhibition walkthroughs, synesthetic knowledge graph retrieval, and event/commission engagement workflows.

---

## 2. Technology Stack & Architectural Standards
All code in this repository strictly adheres to modern, bleeding-edge production standards:

- **Framework**: Next.js 16+ App Router (`src/` directory architecture, Turbopack, standalone container output).
- **UI Runtime**: React 19 (`react@19.2.8`, `react-dom@19.2.8`) with React Server Components (RSC), Suspense, and Server Actions.
- **Language**: TypeScript 5+ in strict mode (`noImplicitAny`, strict null checks).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS theme variables — **No legacy tailwind.config.js**.
- **Component System**: Shadcn UI with high-elegance classical tokens and WCAG AAA compliance.
- **Rich Text Engine**: Universal Tiptap WYSIWYG Editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`) for Page Builder blocks, blogs, curatorial essays, and email templates.
- **3D Spatial Exhibition Engine**: Three.js & React Three Fiber (R3F) for architectural salon walls, procedural lighting rigs, and director-driven camera tours.
- **Print & Publishing Driver**: Isolated Headless Iframe Print Driver (`src/lib/print-isolated-html.ts`) for physical visiting-card ($3.5 \times 2\text{ in}$) and museum-wall ($4 \times 2.5\text{ in}$) placards.
- **Database & Vector Engine**: PostgreSQL 17 with `pgvector` (`pgvector/pgvector:pg17`) running semantic embeddings for multi-modal art and audio exploration.
- **ORM**: Prisma ORM with `postgresqlExtensions` preview feature enabling `vector` and `uuid-ossp` extensions.
- **Authentication**: Better-Auth for administrative RBAC, session tokens, and route protection.
- **Object Storage & Media Vault**: Cloudflare R2 / AWS S3 with signed upload URLs, private origin protection, and local `/media/` fallback.
- **Image Processing**: Sharp for dynamic watermarking, WebP/AVIF conversions, and automated metadata extraction.
- **Email & Notification Engine**: Nodemailer with SMTP/Gmail integration, dynamic token resolution, CID inline logo delivery, and automated audit logging.
- **Knowledge Graph**: Graphify architectural node-link mapping linking architectural modules, database schemas, and curatorial entities.
- **Container Runtime**: Debian 12 Bookworm Slim (`node:22-bookworm-slim`) multi-stage build across all stages (`base`, `deps`, `builder`, `runner`).

---

## 3. Universal Autonomous Agent Lifecycle & Quality Gates
Every autonomous agent, developer, and contributor must strictly follow this execution protocol. **When this section is cited, all steps below must be executed in order without exception:**

### Step 0: Knowledge Graph First Invariant (Mandatory Pre-Task Inspection)
Before designing solutions or editing any codebase files:
- **Inspect the Knowledge Graph**: Autonomous agents and developers MUST inspect the active graph at `graphify-out/` (specifically `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json`) or run `graphify query "<topic>"` to understand architectural boundaries, component hierarchies, and database relationships.
- **Prevent Regressions**: Never modify a shared driver, route handler, or schema without verifying its downstream dependents in the knowledge graph first.

### Step 1: Local-First Validation (Zero Remote Regressions)
Prior to committing or pushing any code, run the complete validation chain:
```bash
# 1. Regenerate database client
npx prisma generate

# 2. Strict static type check (0 errors required)
npx tsc --noEmit

# 3. Code formatting and linting (0 errors required)
npm run lint

# 4. Standalone production compilation test (ensures no dynamic prerender crashes)
npm run build
```

### Step 2: Container Environment Validation
Ensure the local multi-container development environment is running and healthy:
```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml restart web-dev
```
Verify localhost accessibility at http://localhost:3060.

### Step 3: Knowledge Graph Synchronization (Mandatory Post-Workflow Sync)
Whenever files, routes, components, or Prisma schemas are added, modified, or deleted:
```bash
graphify update .
```
This guarantees that the knowledge graph permanently mirrors the current AST matrix, clusters community modules, and eliminates knowledge drift for future agent invocations.

### Step 4: Persistent DevPlans Archiving Rule
All user prompts, implementation plans, and walkthrough logs MUST be persistently archived inside a single local directory: `DevPlans/`.
- **Prompts**: `YYYY-MM-DD_HH-mm-ss_[PROMPT]_<topic-slug>.md`
- **Implementation Plans**: `YYYY-MM-DD_HH-mm-ss_[PLAN]_<topic-slug>.md`
- **Walkthroughs**: `YYYY-MM-DD_HH-mm-ss_[WALKTHROUGH]_<topic-slug>.md`
- **Confidentiality**: `DevPlans/` is strictly ignored in `.gitignore` (`/DevPlans/`). It must NEVER be committed or pushed to Git.

### Step 5: Git Commit & Remote Deployment Pipeline
Once all validation gates pass:
```bash
git add .
git commit -m "<type>(<scope>): concise, imperative summary of changes"
git push origin main
```
GitHub pushes to `main` trigger automated builds on the remote VPS managed via **Coolify**, building the multi-stage `Dockerfile` and deploying the standalone Next.js container alongside PostgreSQL 17.

---

## 4. Living Document Governance Invariant
**`AGENTS.md` and `README.md` are living architectural manifests.**
1. **Mandatory Documentation Sync**: Whenever any agent or developer:
   - Adds or updates a component, service, visual block, or public/admin route.
   - Installs, updates, or removes an npm library or third-party dependency.
   - Extends the Prisma database schema or modifies environment configurations.
   - Creates, modifies, or deprecates a `.skills/` manual.
   **BOTH `AGENTS.md` AND `README.md` MUST be reviewed and updated concurrently in the exact same pull request or commit.**
2. **Preventing Knowledge Decay**: Outdated architectural notes, superseded components, or deprecated workflow steps must be removed from `README.md` and `AGENTS.md` immediately.
3. **No Drift Between Docs and Code**: All descriptions of components, port numbers, environment variables, and print/WebGL capabilities in `README.md` must accurately reflect the codebase at all times.

---

## 5. Enterprise Skill Manuals (`.skills/`)
All code generation and architectural modifications must adhere to the specialized manuals in `.skills/`:
- [`.skills/graphify.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/graphify.md): Codebase & Cultural Knowledge Graph extraction with pgvector cosine similarity.
- [`.skills/ui-ux-pro-max.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/ui-ux-pro-max.md): 99 UX guidelines, luxury cultural portfolio tokens, and WCAG 2.2 AAA accessibility.
- [`.skills/vercel-react-best-practices.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/vercel-react-best-practices.md): Strict RSC boundaries, parallel data fetching, zero-FOUC theme hydration, and re-render prevention.
- [`.skills/better-auth-best-practices.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/better-auth-best-practices.md): Private admin authentication with PostgreSQL adapter, `disableSignUp: true`, and middleware route guards.
- [`.skills/shadcn.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/shadcn.md): Design tokens and component elevation rules for classical and contemporary fine art.
- [`.skills/cloudflare-security.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/cloudflare-security.md): Cloudflare WAF hardening, rate limits, CSP headers, and R2 media policies.
- [`.skills/playwright.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/playwright.md): E2E multi-browser test harness specifications.

---

## 6. Architectural Invariants & Specialized Core Engines

### A. Physical Placard Print Engine (Isolated Iframe Driver)
- **Problem Avoidance**: Never print modal dialogs in-situ via `window.print()`. Radix portals and Tailwind `fixed`/`overflow-hidden` classes collapse Chromium print engines into $0\times0\text{ px}$ blank pages or cause background dashboard bleed.
- **Standard Driver (`src/lib/print-isolated-html.ts`)**:
  - Always write rendered placards into a dedicated, unstyled headless `<iframe>` and invoke `iframe.contentWindow.print()`.
  - Enforce explicit physical dimensions:
    - **Visiting Card (Landscape)**: $88.9\text{ mm} \times 50.8\text{ mm}$ ($3.5 \times 2\text{ in}$).
    - **Visiting Card (Portrait)**: $50.8\text{ mm} \times 88.9\text{ mm}$ ($2 \times 3.5\text{ in}$).
    - **Museum Placard (Landscape)**: $101.6\text{ mm} \times 63.5\text{ mm}$ ($4 \times 2.5\text{ in}$).
    - **Museum Placard (Portrait)**: $63.5\text{ mm} \times 101.6\text{ mm}$ ($2.5 \times 4\text{ in}$).
  - All cards enforce `page-break-inside: avoid !important; break-inside: avoid !important;`.
  - Maintain an $18\text{ mm}$ safe margin at the base of every card to prevent physical acrylic/brass stand clamps from occluding metadata.
- **e-Catalog Synchronous Preloader & Asynchronous Decoding Barrier**:
  - In `src/lib/print-isolated-html.ts`, normalize all HTML images to force `loading="eager"` and `decoding="sync"`.
  - The driver awaits `Promise.all(images.map(img => img.decode().catch(...)))` followed by a safety buffer before invoking `iframe.contentWindow.print()`.
  - In `src/components/public/catalog-print-button.tsx`, an in-situ decoding preloader displays a responsive progress indicator while decoding offscreen plates, completely eliminating blank image omissions on plates 2+ in browser PDF exports.

### B. 3D WebGL Exhibition Salon Wall Engine
- **Aspect Ratio Preservation**:
  - NEVER force artworks into uniform square aspect ratios (`aspect-square` or $1:1$).
  - Calculate Three.js frame, gold fillet, matting, and canvas plane dimensions dynamically from the image's intrinsic ratio (`naturalWidth / naturalHeight`).
  - The outer frame wraps around the artwork's natural proportions without squishing or cropping.
- **Multi-Wall Automatic Partitioning**:
  - Use `maxArtworksPerWall` (default: 4, range: 2–8).
  - When hung artworks exceed this threshold, the engine automatically partitions the collection into sequential corridor walls (Wall 1, Wall 2, etc.), preventing visual crowding.
- **Zero Overlay Invariant**:
  - Never overlay dark administrative cards, badges, or thumbnail strips across the 3D viewing canvas.
  - On desktop, mount the metadata placard as a physical white plaque on the wall to the right of the artwork.
  - On mobile (< 768px), hide the on-wall placard completely (`hidden md:flex`) and center the artwork cleanly.

### C. Universal Email Notification & Form Dispatch Engine
- **Decoupled Alert Routing**: Inbound form submissions route to `systemSetting.adminAlertEmail`, never to console super-admin credentials.
- **Dynamic Form Discovery**: `/api/admin/forms/discover` dynamically aggregates core triggers (`contact`, `event_rsvp`, `custom_form`), Page Builder form blocks, and active Event registration forms.
- **Dual Delivery Logo Engine (CID + HTTPS)**:
  - Email branding uses the single source of truth: `SystemSetting.logoUrl` from the "General" settings tab.
  - Embed local disk images as inline MIME attachments (`cid:atelier-brand-logo`) to guarantee instant rendering in Gmail, Outlook, and Apple Mail without broken image icons.
  - Use `getAbsoluteAssetUrl()` to resolve remote storage assets with fully qualified HTTPS URLs.
- **Audit Logging**: Persist every outbound message in `EmailDispatchLog` with delivery statuses (`SENT`, `FAILED`), error captures, and CSV export capabilities.

### D. Strict Binary Theme & Contrast Invariant
- **Binary Modes Only**: Strictly `"dark"` and `"light"`. `enableSystem` is permanently `false`.
- **Zero Inverted Surfaces**: Never hardcode dark backgrounds without a `dark:` prefix. Light mode surfaces must resolve to `bg-card` (`#FFFFFF`) with visible `#CBD5E1` borders.
- **Class-Based Dark Engine**: `src/app/globals.css` must always maintain `@custom-variant dark (&:where(.dark, .dark *));` so OS dark preferences do not leak into Light mode.
- **Placard Contrast Lock**: Physical museum placards and on-screen exhibition placards rendered beneath or beside 3D WebGL Exhibition Walls must maintain invariant high-contrast dark text (`#111827`, `#374151`) on pure white paper (`#FFFFFF`, `[color-scheme:light]`), regardless of website dark/light mode toggles.

### E. Multi-Tenant Brand Identity & Asset Engine (.ico Favicon & Conditional Phone)
- **Dynamic Brand Notice**: The public footer never hardcodes copyright notices or watermark fallbacks; it renders dynamic `footerConfig.copyrightNotice` exclusively.
- **Conditional Contact Phone Suppression**: Whenever Studio / Contact Phone is blank, empty, or null in System Settings, the UI completely suppresses the phone row (both icon and text) across public footers and headers without displaying default placeholder phone numbers.
- **Native Favicon & Vector Engine**: Media upload pipeline provides dedicated direct passthrough bypass for `.ico` (`image/x-icon`, `image/vnd.microsoft.icon`) and `.svg` (`image/svg+xml`), preventing Sharp rasterization or WebP degradation of multi-resolution icons and scalable vector graphics.

### F. Dynamic Archive Subtitle & Idempotent Non-Destructive Tenant Deployment
- **Configurable Archive Subtitle**:
  - `SystemSetting.archiveSubtitle` provides a dedicated field in Admin Settings -> General ("Archive Subtitle / Brand Tagline") rendered directly beneath the brand title in `Navbar`.
  - If omitted or empty, the subtitle element is cleanly suppressed without rendering empty layout rows or falling back to hardcoded text.
- **Storage Credentials Neutrality**:
  - Storage credential inputs (S3/R2 access keys, secret keys, bucket names) strictly display neutral placeholder formats (e.g. `placeholder="e.g. AKIAIOSFODNN7EXAMPLE"`) and must never be pre-populated or defaulted with administrative email addresses.
- **Strict Seeder Non-Destructive Invariant**:
  - `prisma/seed.ts` enforces that if an `existingSettings` record is detected, it logs `🛡️ Existing SystemSetting detected. Skipping configuration overwrite to protect client data.` and skips all configuration mutations.
  - Across container deployments and restarts, active tenant configuration, custom page blocks, menu items, and soft-deleted entities (`isDeleted: true`) are strictly preserved and never overwritten or resurrected.

### G. Universal Contact Form & Generalized Multi-Tenant Email Templates
- **Universal Form Structure**: Standard contact form blocks render 5 universal inquiry fields: Full Name, Email Address, Phone Number (optional), Subject Line, and Message. Specialized or artist-specific presets ("Artwork Acquisition", "Commission Work") are eradicated in favor of open-ended subject fields.
- **Dynamic Organization Token Resolution**: System notification and auto-responder email templates resolve `{organization_name}` dynamically from `SystemSetting.siteName` (with graceful fallback to platform branding). Zero artist-specific strings are hardcoded in seeder presets or defaults.
- **Unified Lead Ingestion**: Form submissions routed through `/api/forms/submit` map generic inquiries cleanly to the `contact` trigger template and CRM Lead pipeline, delivering alerts to `adminAlertEmail` with encrypted transmission notices.

### H. Dynamic Admin Dashboard Metric Calculation Engine
- **Decoupled Overview Tiles**: Dashboard overview cards are decoupled from single-client or single-medium terminology. All default tiles adhere to enterprise taxonomy: Catalog & Assets, Categories & Classifications, Events & Showcases, Inbound Inquiries & Leads, Digital e-Catalogs, Articles & Publications, System Health & Services, and Quick Operations.
- **Dynamic Metric Source Resolver**: The backend resolver (`/api/admin/overview/metrics` and `DashboardWidget.metricSource`) aggregates live counts across PostgreSQL tables (`count:artworks`, `count:categories`, `count:events`, `count:leads`, `count:event_rsvps`, `count:event_specific_rsvp`, `count:catalogs`, `count:pages`, `count:posts`) with zero-latency parallel queries.
- **Specific Event Filtering**: When `count:event_specific_rsvp` is selected, `metricFilterId` scopes registrations dynamically to the specified scheduled event.
- **SSR Pre-Computation**: `src/app/admin/(dashboard)/page.tsx` executes parallel count queries on the server, guaranteeing that initial renders and full page reloads display live metrics without client-side pop-in or hydration lag.

### I. Multi-Cloud Storage Architecture (Google Workspace & Nextcloud WebDAV)
- **Universal Provider Dispatch**: Object storage supports `LOCAL`, `S3`, `R2`, `GOOGLE_DRIVE`, and `NEXTCLOUD` with transparent failover and zero-downtime reconfiguration.
- **Google Workspace Storage & Sheets Sync**:
  - `src/lib/storage/google-drive-driver.ts`: Implements OAuth2 token refresh, multipart asset upload, public thumbnail link generation (`lh3.googleusercontent.com/d/`), and Google Sheets lead append integration for CRM synchronization.
- **Nextcloud WebDAV & OCS Share Engine**:
  - `src/lib/storage/nextcloud-driver.ts`: Executes HTTP PUT uploads with recursive `MKCOL` directory provisioning, authenticated via App Passwords or Basic Auth, and provisions public read-only shares via the Nextcloud OCS Share API (`/ocs/v2.php/apps/files_sharing/api/v1/shares`).
- **Dynamic Driver Caching & Test Validation**:
  - Dedicated test connection endpoint at `/api/admin/settings/test-storage` allows verifying credentials prior to saving. `clearStorageCache()` guarantees that administrative config updates take effect immediately without requiring process restarts.

### J. Dynamic Enterprise Landing Page Studio & Atomic Homepage Promotion
- **Decoupled Sandbox Invariant**: Creating or editing landing pages never mutates or overwrites the active homepage (`isHomepage: false` by default).
- **7 Industry Archetype Blueprints**:
  - `PROFESSIONAL`: Executive hero, metric ticker counters, split practice areas grid, institutional CTA.
  - `PORTFOLIO`: Living atelier hero, horizontal exhibition strip, authenticated monograph tags, 24K gold foil badges.
  - `RESTAURANT`: Atmospheric banner, multi-category dining matrix, dietary pill chips (Chef Signature, Gluten-Free, Vegan).
  - `HOSPITALITY`: Luxury retreat hero, signature suite cards (area, occupancy, view), curated amenity icon strip.
  - `HEALTHCARE`: NABH/ISO accredited clinic hero, department specialty grid, physician practitioner cards.
  - `CORPORATE`: SaaS glow hero with hover elevation grids, SLA performance cards, and expandable FAQ accordion.
  - `BLANK`: 12-column unconstrained canvas ready for custom visual builder blocks.
- **Atomic Homepage Promotion & Demotion**:
  - Backend route `/api/admin/pages/[id]/promote` executes atomic Prisma transactions: sets `isHomepage: false` across all pages, then marks the target page `isHomepage: true`.
  - Demotion (`DELETE`) cleanly unsets `isHomepage`, restoring the default curated homepage fallback instantly.
- **Root URL Priority Engine**:
  - `src/app/page.tsx` queries `where: { OR: [{ isHomepage: true }, { slug: "home" }, { slug: "index" }] }` with `orderBy: [{ isHomepage: "desc" }, { updatedAt: "desc" }]`, prioritizing promoted landing pages with zero hydration lag.

### K. SavazAI Multi-Tenant Brand Neutrality Invariant
- **Total Decoupling from Single-Tenant Data**: The codebase, seeders, administration forms, input placeholders, and system defaults must never contain hardcoded client-specific names, domains, or administrative emails (e.g. `admin@lalitakapilavai.com`, `lalitakapilavai.com`).
- **Standardized Neutral Formats**:
  - Placeholders must strictly utilize generic, industry-standard examples: `yourdomain.com`, `admin@yourdomain.com`, `https://cloud.yourdomain.com`, `1234567890-abc.apps.googleusercontent.com`, `GOCSPX-xxxxxxxxxxxxxxxx`, `AKIAIOSFODNN7EXAMPLE`.
- **Browser Autofill & Credential Guard**:
  - Administrative configuration inputs (OAuth client IDs, usernames, passwords, API tokens) must declare explicit non-credential field names (`name="..."`, `id="..."`), `autoComplete="off"` or `autoComplete="new-password"`, and password manager ignore tags (`data-1p-ignore="true"`, `data-lpignore="true"`).
  - This guarantees that Chromium or browser password managers never involuntarily inject the currently logged-in administrator's email or credentials into cloud storage or configuration input fields.
- **Dynamic Configuration Invariant**: All branding, identities, domains, emails, and archive titles must resolve at runtime through database configuration (`SystemSetting`, `WhiteLabelConfig`, `ThemeConfig`). Zero client data shall be baked into code artifacts.

### L. Multi-Day Event RSVP Interval Engine & Dynamic Attendance Tracking
- **Configurable RSVP Settings**:
  - `EventRsvpConfig` provides full administrative control over:
    - `requireDateSelection` (boolean)
    - `allowMultipleDates` (boolean, enabling multi-day selection via interactive day cards/checkboxes)
    - `timeSlotRequirement` (`"mandatory"` | `"optional"` | `"disabled"`)
    - `slotIntervalMinutes` (15, 30, 45, 60, 120 minutes or custom)
    - `slotCapacity` (optional integer limit per slot).
  - Public booking `/events/[slug]` dynamically calculates time slots per selected day using its specific `startTime` and `endTime`.
  - For optional slot modes, a clean "Anytime / Flexible Arrival" option is provided.
  - Submissions to `/api/events/register` persist `selectedDates` and `selectedSlot` into CRM Lead custom fields and registration models.
  - CRM Leads table, details dialog, and CSV export display attendance dates and time slot badges.

### M. 3D WebGL Exhibition Salon Wall Studio & Realistic Environments
- **7 Procedural Architectural Environments**:
  - `modern-minimalist`, `imperial-palace`, `indian-atelier`, `residential-salon`, `heritage-villa`, `corporate-gallery`, and `custom`.
  - Architectural 3D decor objects (benches, fluted plinths, brass urlis, stanchions) are positioned procedurally and strictly outside artwork display bounds ($y \le 0.45\text{ m}$ or flanking perimeter) to eliminate visual occlusion.
- **Cinematic Interpolation & Proportional Clearance**:
  - Camera transitions use damped cubic easing (`lerp(target, delta * 3.5)` in `useFrame`) starting from wide-angle establishing shots, gliding smoothly toward focused artworks, and executing sweeping curves between adjacent corridor walls.
  - Dynamic proportional artwork spacing enforces a mandatory $0.8\text{ m}$ minimum clearance gap between adjacent frames, eliminating visual collisions regardless of orientation.
- **Responsive High-Contrast Presentation**:
  - Bottom metadata placard is locked to high-contrast dark slate (`bg-slate-900 text-white`) in Light Mode, preventing black-on-black button clashes.
  - On viewports < 768px, a floating mobile provenance drawer provides full metadata and navigation controls.

### N. Placard Customizer Live Data Sync & Currency Overrides
- **Live Price Synchronization**:
  - Modal opening triggers automatic background synchronization from the artworks database (`/api/admin/artworks`), populating fallback valuation maps.
  - Card-level overrides allow editing titles, medium, dimensions, year, price, and currency (INR, USD, EUR, GBP, AED, SGD).
  - "Save Placard Customizations" persists overrides locally and synchronizes updates directly to the PostgreSQL database via `PUT /api/admin/artworks/[id]`.
- **Sanitized Alt Text**:
  - Media uploader and vault dialogs default alt text to an empty string `""` rather than raw filenames.






