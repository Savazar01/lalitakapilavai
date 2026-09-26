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


