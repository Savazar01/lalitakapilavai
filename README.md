# SavazAI WebApps Platform

> **Enterprise Multi-Tenant Digital Atelier, High-Fidelity Cultural Archive, 3D WebGL Exhibition Corridor, and Museum Publishing System.**  
> *Architected, developed, and maintained by **Savazar**.*

---

## 1. Executive Platform Overview

The **SavazAI WebApps Platform** is an enterprise-grade digital publishing, archiving, and immersive presentation suite. While historically initiated to honor fine art and classical music traditions, the architecture is completely client-agnostic, white-label, and multi-tenant. It empowers fine art masters, traditional heritage artists, museum collections, cultural foundations, and gallery curators to curate, exhibit, preserve, and physically print museum-grade exhibition assets with total brand sovereignty.

### Core Architectural Pillars
- **3D WebGL Spatial Exhibition Salon Corridor**: Interactive, director-driven architectural gallery halls built with Three.js/R3F, featuring natural artwork aspect ratio preservation, directional gallery spotlighting, and automatic multi-wall corridor partitioning.
- **Physical Gallery Placard & Publishing Engine**: An isolated headless iframe print driver generating physical visiting-card ($3.5 \times 2\text{ in}$) and museum-wall ($4 \times 2.5\text{ in}$) display placards with crop marks, vector QR provenance links, and acrylic clamp safety margins.
- **Visual Drag-and-Drop Page Builder & Component Studio**: Modular editorial layout engine supporting rich media blocks, interactive e-Catalogs, responsive sliders, and live contrast-aware typography.
- **Dynamic Multi-Modal Email & Notification Studio**: Inbound alert decoupling, automatic form discovery across dynamic page blocks, and a universal Tiptap WYSIWYG editor with dual-delivery logo resolution (CID inline MIME attachments + HTTPS fallback) and full audit telemetry.
- **Synesthetic Knowledge Graph & Semantic Vector Engine**: PostgreSQL 17 with `pgvector` powering multi-modal exploration across visual motifs, provenance tags, and audio-visual archives.
- **Unified CRM Leads & Acquisition Funnel**: Multichannel inquiry capture linking physical placard QR scans, bespoke commission intakes, and dynamic event RSVP registrations.
- **Multi-Tenant White-Label Administration**: Complete brand decoupling with dynamic system settings, theme studio (featuring the signature "Imperial Atelier" palette), and Better-Auth administrative access control.
- **Brand Identity & Native Media Engine**: Full `.ico` and `.svg` bypass upload engine preserving multi-resolution favicons and scalable vector graphics, paired with zero-fallback conditional phone suppression and dynamic footer brand governance.

---

## 2. Technology Stack & Modern Architectural Standards

- **Core Framework**: Next.js 16+ App Router (`src/` directory layout, Turbopack, standalone production compilation).
- **UI Runtime**: React 19 (`react@19.2.8`, `react-dom@19.2.8`) with React Server Components (RSC), Suspense, and Server Actions.
- **Language**: TypeScript 5+ in strict mode (`noImplicitAny`, strict null checks).
- **Styling Engine**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS theme variables — **No legacy tailwind.config.js**.
- **Component Primitives**: Shadcn UI primitives hardened with WCAG 2.2 AAA accessibility.
- **Rich Text Suite**: Universal Tiptap WYSIWYG Editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`) with one-click token insertion chips and accessible zero-state placeholders.
- **3D Spatial Graphics**: Three.js & React Three Fiber (R3F) for procedural architectural backdrops and cinematic camera paths.
- **Print Subsystem**: Isolated Headless Iframe Print Driver (`src/lib/print-isolated-html.ts`) ensuring 1:1 physical millimeter scaling without browser print UI bleed.
- **Database & Vector Storage**: PostgreSQL 17 with `pgvector` (`pgvector/pgvector:pg17`).
- **ORM**: Prisma ORM with `postgresqlExtensions` preview feature enabling `vector` and `uuid-ossp` extensions.
- **Authentication**: Better-Auth for private admin authentication, RBAC, and session management (public self-registration disabled).
- **Object Storage & Media Vault**: Cloudflare R2 / AWS S3 with signed private URLs and dynamic image watermarking (Sharp).
- **Email Delivery**: Nodemailer with SMTP/Gmail integration, dynamic token resolution, CID inline logo embedding, and automated audit logging.
- **Container Infrastructure**: Multi-stage Debian 12 Bookworm Slim (`node:22-bookworm-slim`) for full binary compatibility with Sharp (libvips) and native Prisma query engines.

---

## 3. High-Level Modular Architecture

```
SavazAI WebApps Platform
├── src/
│   ├── app/
│   │   ├── (public)/                 # Client-Facing Portal
│   │   │   ├── page.tsx              # Dynamic Homepage with Visual Blocks
│   │   │   ├── gallery/              # High-Res Artwork Archive & Lightbox
│   │   │   ├── artwork/[slug]/       # Dedicated Artwork Presentation & Inquiry
│   │   │   ├── catalogs/[slug]/      # Interactive Virtual e-Catalog Reader
│   │   │   ├── events/               # Exhibition & Concert Hub
│   │   │   ├── events/[slug]/        # Event Details & Dynamic RSVP Form
│   │   │   ├── blogs/                # Curatorial Essays & Blog Archive
│   │   │   ├── blogs/[slug]/         # Rich Typography Article Viewer
│   │   │   ├── commission/           # Bespoke Fine Art Commission Portal
│   │   │   └── [slug]/               # Dynamic Page Builder Renderer
│   │   ├── admin/                    # Secured Multi-Tenant Admin Control Center
│   │   │   ├── (dashboard)/
│   │   │   │   ├── artworks/         # Artwork Catalog & Batch Placard Studio
│   │   │   │   ├── catalogs/         # e-Catalog Studio & Monograph Builder
│   │   │   │   ├── events/           # Exhibitions, Recitals & RSVP Manager
│   │   │   │   ├── pages/            # Page Builder Index
│   │   │   │   ├── pages/[id]/builder# Drag-and-Drop Visual Block Studio
│   │   │   │   ├── posts/            # Blog & Curatorial Essay Editor
│   │   │   │   ├── leads/            # Unified CRM Inquiries & Acquisition
│   │   │   │   ├── categories/       # Artistic Taxonomies & Traditions
│   │   │   │   ├── navigation/       # Header & Footer Navigation Builder
│   │   │   │   ├── users/            # Administrative RBAC Management
│   │   │   │   └── settings/         # White-Label, Theme, SMTP & Mail Config
│   │   │   └── login/                # Better-Auth Protected Entrypoint
│   │   └── api/                      # Protected REST & Server Action Endpoints
│   │       ├── admin/                # Admin APIs (Artworks, Events, Forms, Mail)
│   │       ├── auth/[...all]/        # Better-Auth Session Handlers
│   │       ├── forms/submit/         # Decoupled Public Form Handler
│   │       ├── events/register/      # Public RSVP Registration Engine
│   │       └── media/[...path]/      # Watermarked Image Delivery Proxy
│   ├── components/
│   │   ├── admin/                    # Administration UI (Tiptap, Placard Studio)
│   │   ├── builder/                  # Visual Page Builder Inspector & Blocks
│   │   ├── public/                   # Public Experience Blocks & 3D Salon Wall
│   │   └── ui/                       # Shadcn Accessible UI Primitives
│   ├── lib/                          # Core Drivers (Print, Email, Auth, Prisma)
│   └── types/                        # Enterprise TypeScript Specifications
├── prisma/
│   ├── schema.prisma                 # Declarative Schema (PostgreSQL 17 + pgvector)
│   └── seed.ts                       # Idempotent Provisioning Engine
├── docker-compose.yml                # Production Orchestration (Web + PostgreSQL 17)
├── docker-compose.dev.yml            # Multi-Container Development Stack
├── Dockerfile                        # Multi-Stage Debian 12 Production Build
└── docker-entrypoint.sh              # Zero-Touch Schema Sync & Seed Hook
```

---

## 4. Full Platform Feature & Engine Catalog

### A. Public Web Experiences
1. **Classical Hero Showcase & Visual Storytelling**:
   - Full-bleed media hero blocks with dynamic title, subtitle, and primary call-to-action buttons.
   - Interactive timeline blocks highlighting master artist lineages, exhibitions, and classical vocal performances.
2. **3D WebGL Spatial Exhibition Salon Corridor**:
   - Natural artwork aspect ratio preservation (`naturalWidth / naturalHeight`), wrapping canvas, gilded fillets, and outer timber frames without cropping.
   - Procedural gallery lighting rigs with directional spotlights.
   - Multi-wall corridor partitioning (`maxArtworksPerWall`) automatically dividing collections across navigable gallery walls.
   - Mobile-responsive layout cleanly hiding on-wall placards on mobile (`< 768px`) with metadata rendered beneath the canvas.
3. **Archival Fine Art Gallery & High-Res Inspection**:
   - Filterable masonry artwork grid by traditional schools and categories.
   - Deep-zoom lightbox modal for inspecting fine brushstrokes and gold relief.
   - Protected image proxy applying dynamic watermarks and preventing raw asset theft.
4. **Interactive e-Catalog Digital Monographs**:
   - Virtual page-flip presentation simulating high-end physical exhibition catalogs.
   - Curatorial essays, high-resolution artwork plates, and provenance notes.
   - One-click downloadable PDF generation.
5. **Cultural Events, Recitals & RSVP Hub**:
   - Exhibition calendars and recital schedules with venue maps and dynamic hero earmark badges (`{event.earmarkText}`).
   - Seamless attendee RSVP registration modal with instant email confirmation.
6. **Curatorial Essays & Blog Archive**:
   - Editorial blog repository formatted with high-elegance typography.
   - Category filtering, author attribution, and reading-time estimations.
7. **Bespoke Commission Intake Portal**:
   - Dedicated commissioning flow with multi-tier budget selection and detailed project specifications.

---

### B. Admin Control Center (10 Core Operational Modules)

#### 1. Artwork Vault & Catalog Manager (`/admin/artworks`)
- Comprehensive metadata taxonomy: Title, Medium, Art Form / Category, Dimensions (inches & cm), Year, Pricing, and Curatorial Notes.
- High-resolution plate upload with automated Sharp WebP/AVIF conversions and dynamic watermarking.
- Excel bulk import/export with automated XLSX template generation.
- Integrated Museum Placard Print button for single and batch production.

#### 2. Museum Placard Print Studio (`src/lib/print-isolated-html.ts`)
- **Exact Physical Dimensions**: Supports Standard Visiting Cards ($3.5 \times 2\text{ in}$ / $88.9 \times 50.8\text{ mm}$) and Museum Wall Placards ($4 \times 2.5\text{ in}$ / $101.6 \times 63.5\text{ mm}$) in both Landscape and Portrait orientations.
- **Isolated Iframe Print Driver**: Renders print layouts in a dedicated, headless `<iframe>`, eliminating modal background bleed and Chromium $0\times0\text{ px}$ blank page collapses.
- **Editorial Hierarchy**: Header -> Title -> Medium -> Dimensions -> Thumbnail/QR Provenance -> Year -> Curatorial Notes.
- **Stand Clamp Safety Margin**: Enforces an $18\text{ mm}$ safe base margin to prevent acrylic or brass gallery clamps from occluding typography.
- **Cross-Module Availability**: Accessible from `/admin/artworks`, `/admin/catalogs/[id]`, and `/admin/events`.

#### 3. Visual Drag-and-Drop Page Builder (`/admin/pages/[id]/builder`)
- Modular block studio supporting Hero Showcase, 3D Exhibition Salon Wall, Text Blocks, Image Blocks, Media Carousels, and Dynamic Form Blocks.
- Real-time live preview with responsive device breakpoints (Desktop, Tablet, Mobile).
- Clean JSON serialization stored in the `Page.content` database column.

#### 4. Interactive e-Catalog Studio (`/admin/catalogs`)
- Digital monograph creator with cover design, curatorial essays, and multi-artwork curation.
- Drag-and-drop artwork ordering and display curation.
- Virtual flip-book preview and batch placard printing for featured collection items.

#### 5. Events & Concerts Studio (`/admin/events`)
- Exhibition, recital, and workshop management with venue locations and dates.
- Dynamic "Hero Earmark / Subtitle Badge" editor configuring public hero labels.
- Real-time RSVP attendee tracker with guest count management and CSV roster export.

#### 6. Dynamic Mail Message Studio & Audit Telemetry (`/admin/settings` -> Mail Msg Config)
- **Decoupled Alert Routing**: Inbound submissions route to `systemSetting.adminAlertEmail`, never to administrative superadmin credentials.
- **Dynamic Form Discovery**: Automatically aggregates Core triggers (`contact`, `acquisition`, `event_rsvp`), Page Builder form blocks, and active Event registration forms.
- **Universal Tiptap WYSIWYG Editor**: Visual rich text editor for designing email notifications with clickable dynamic token chips (`{name}`, `{email}`, `{event_title}`, `{event_date}`).
- **Dual Delivery Logo Engine**: Employs CID inline multipart attachments (`cid:atelier-brand-logo`) for local media files alongside absolute HTTPS fallbacks, resolving broken images across Gmail, Outlook, and Apple Mail.
- **Immutable Audit Logging**: Logs every outbound dispatch to `EmailDispatchLog` with delivery statuses (`SENT`, `FAILED`), error telemetry, and CSV export.

#### 7. Unified CRM Leads & Acquisition Inbox (`/admin/leads`)
- Multichannel lead capture consolidating inquiries from artwork pages, commission requests, event RSVPs, and custom Page Builder forms.
- Status pipeline tracking (`NEW`, `IN_REVIEW`, `CONTACTED`, `ARCHIVED`).
- Custom JSON payload inspector capturing bespoke form fields.

#### 8. Curatorial Posts & Blog Publisher (`/admin/posts`)
- Universal Tiptap rich-text publishing environment for blog articles and monographs.
- Category tagging, feature image management, and slug optimization.

#### 9. White-Label Theme & System Studio (`/admin/settings`)
- **General Branding**: Dynamic atelier title, subtitle, bio, contact email, and single-source-of-truth brand logo URL.
- **Theme Studio**: Live palette selector with the flagship **"Imperial Atelier"** preset, custom primary/accent hex picker, and strict binary theme preview.
- **Gmail / SMTP Configuration**: Dynamic SMTP host, port, credentials, and admin alert routing recipient.
- **Media Vault Settings**: Cloudflare R2 / AWS S3 endpoint, bucket name, access keys, and public CDN domain.

#### 10. Security, Better-Auth RBAC & User Administration (`/admin/users`)
- Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
- Public registration strictly disabled (`disableSignUp: true`).
- Middleware session verification and brute-force protection.

---

## 5. Quickstart & Local Development

### Prerequisites
- Node.js `v22.x`
- Docker & Docker Compose
- Git

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/Savazar01/lalitakapilavai.git
cd lalitakapilavai
cp .env.example .env
```

### Step 2: Launch Local Multi-Container Stack
Start PostgreSQL 17 with `pgvector` (port `5633`) and the Next.js development server (port `3060`):
```bash
docker compose -f docker-compose.dev.yml up -d
```

Verify database and `vector` extension status:
```bash
docker compose -f docker-compose.dev.yml exec postgres-dev psql -U postgres -d lalitakapilavai_dev -c "\dx"
```

### Step 3: Initialize Database & Run Idempotent Seed
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 4: Access Endpoints
- **Public Portal**: http://localhost:3060
- **Admin Control Center**: http://localhost:3060/admin
- **Admin Login**: http://localhost:3060/admin/login
  - Default Superadmin: Configured via `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` in `.env`.

---

## 6. Zero-Touch Coolify VPS Deployment

The platform is engineered for **100% zero-touch deployment** on any VPS running Coolify. On container boot, `docker-entrypoint.sh` automatically synchronizes PostgreSQL schemas (`prisma db push`) and provisions administrative credentials idempotently.

### Deployment Runbook

1. **Step 1: Create Resource in Coolify**
   - In Coolify, click **+ New** -> **Git Repository**.
   - URL: `https://github.com/Savazar01/lalitakapilavai` | Branch: `main`.
2. **Step 2: Set Build Pack**
   - Select **Docker Compose** (Coolify detects root `docker-compose.yml`).
3. **Step 3: Assign Domain & Traefik Routing**
   - Enter your production domain (e.g., `https://your-domain.com`).
   - Coolify connects the web container to the shared `coolify` reverse-proxy network.
4. **Step 4: Configure Environment Variables**
   - Supply `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_INITIAL_PASSWORD`.
5. **Step 5: Deploy**
   - Click **Deploy**. Coolify executes the multi-stage Debian 12 build, starts PostgreSQL 17 alongside the standalone Next.js server on port `3060`, runs database migrations, and exposes the application securely.

---

## 7. Production Environment Variables Template

```bash
# ==============================================================================
# SAVAZAI WEBAPPS PLATFORM — PRODUCTION ENVIRONMENT VARIABLES
# ==============================================================================

# Database Connection (PostgreSQL 17 + pgvector)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=generate_strong_password_here
POSTGRES_DB=savazai_webapps_prod

# Core Application Networking
NODE_ENV=production
PORT=3060
NEXT_PUBLIC_APP_URL=https://your-domain.com
COOLIFY_FQDN=your-domain.com

# Better-Auth Private Authentication
BETTER_AUTH_SECRET=generate_32_byte_hex_string
BETTER_AUTH_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_NAME=SavazAI Platform Admin
ADMIN_INITIAL_PASSWORD=YourStrongInitialAdminPassword2026!

# Cloudflare R2 / AWS S3 Media Storage Vault
STORAGE_PROVIDER=r2
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET_NAME=savazai-media-vault
S3_ACCESS_KEY_ID=your_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key
S3_PUBLIC_DOMAIN=https://media.your-domain.com
S3_REGION=auto

# Digital Asset Watermark Controls
WATERMARK_TEXT=© SavazAI WebApps | All Rights Reserved
WATERMARK_OPACITY=0.75
```

---

## 8. Architectural Documentation & Living Governance
- [`AGENTS.md`](./AGENTS.md): Autonomous agent operating instructions, quality gates, and architectural invariants.
- [`.skills/ui-ux-pro-max.md`](./.skills/ui-ux-pro-max.md): SavazAI WebApps Design System, "Imperial Atelier" tokens, and WCAG 2.2 AAA accessibility.
- [`.skills/graphify.md`](./.skills/graphify.md): Knowledge Graph First Invariant and semantic vector exploration.
- [`.skills/playwright.md`](./.skills/playwright.md): E2E automated test harness procedures across web and admin scopes.
- [`.skills/cloudflare-security.md`](./.skills/cloudflare-security.md): Edge WAF rules, CSP headers, and multi-tenant R2 media protection.
- [`.skills/better-auth-best-practices.md`](./.skills/better-auth-best-practices.md): Private admin RBAC and session security.
- [`.skills/shadcn.md`](./.skills/shadcn.md): Component elevation tokens and fine art framing rules.
- [`.skills/vercel-react-best-practices.md`](./.skills/vercel-react-best-practices.md): RSC boundaries, parallel data fetching, and strict binary theme hydration.
