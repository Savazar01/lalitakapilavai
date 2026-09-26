# SavazAI WebApps Platform

> **Enterprise Multi-Tenant Digital Atelier, High-Fidelity Cultural Archive, 3D WebGL Exhibition Corridor, and Museum Publishing System.**  
> *Architected, developed, and maintained by **Savazar**.*

---

## 1. Executive Platform Overview

The **SavazAI WebApps Platform** is an enterprise-grade digital publishing, archiving, and immersive presentation suite. While historically initiated to honor fine art and classical music traditions, the architecture is fully client-agnostic, white-label, and multi-tenant. It allows artists, master ateliers, private collections, cultural foundations, and gallery curators to publish, preserve, exhibit, and physically print museum-grade exhibition assets with total brand sovereignty.

### Core Architectural Pillars
- **3D WebGL Spatial Exhibition Salon Corridor**: Interactive, director-driven architectural gallery halls built with Three.js/R3F, featuring natural artwork aspect ratio preservation, directional gallery spotlighting, and automatic multi-wall corridor partitioning.
- **Physical Gallery Placard & Publishing Engine**: An isolated headless iframe print driver generating physical visiting-card ($3.5 \times 2\text{ in}$) and museum-wall ($4 \times 2.5\text{ in}$) display placards with crop marks, vector QR provenance links, and acrylic clamp safety margins.
- **Dynamic Multi-Modal Email & Notification Studio**: Inbound alert decoupling, automatic form discovery across dynamic page blocks, and a universal Tiptap WYSIWYG editor with dual-delivery logo resolution (CID inline MIME attachments + HTTPS fallback) and full audit telemetry.
- **Synesthetic Knowledge Graph & Semantic Vector Engine**: PostgreSQL 17 with `pgvector` powering multi-modal exploration across visual motifs, provenance tags, and audio-visual archives.
- **Visual Page Builder & Component Studio**: Drag-and-drop editorial layout engine supporting rich media blocks, interactive e-Catalogs, responsive sliders, and live contrast-aware typography.

---

## 2. Technology Stack & Modern Architectural Standards

- **Core Framework**: Next.js 16+ App Router (`src/` directory layout, Turbopack, standalone production compilation).
- **UI Runtime**: React 19 (`react@19.2.8`, `react-dom@19.2.8`) with React Server Components (RSC), Suspense, and Server Actions.
- **Language**: TypeScript 5+ in strict mode (`noImplicitAny`, strict null checks).
- **Styling Engine**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS theme variables — **No legacy tailwind.config.js**.
- **Component Primitives**: Shadcn UI primitives hardened with WCAG 2.2 AAA accessibility.
- **Rich Text Suite**: Universal Tiptap WYSIWYG Editor (`@tiptap/react`, `@tiptap/starter-kit`) with one-click token insertion chips.
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
│   │   ├── (public)/                 # Client-facing portal (Home, Gallery, Events, Catalogs)
│   │   ├── admin/                    # Secured Multi-Tenant Admin Control Center
│   │   │   ├── (dashboard)/
│   │   │   │   ├── artworks/         # Artwork Catalog & Batch Placard Print Studio
│   │   │   │   ├── catalogs/         # Interactive PDF & Virtual e-Catalog Studio
│   │   │   │   ├── events/           # Exhibitions, Recitals & RSVP Management
│   │   │   │   ├── pages/            # Visual Drag-and-Drop Page Builder
│   │   │   │   └── settings/         # White-Label, SMTP, Theme, & Mail Msg Config
│   │   │   └── login/                # Better-Auth Protected Entrypoint
│   │   └── api/                      # Protected REST & Server Action Endpoints
│   ├── components/
│   │   ├── admin/                    # Administration UI (Tiptap, Placard Studio, Form Modals)
│   │   ├── builder/                  # Visual Page Builder Inspector & Block Editors
│   │   └── public/                   # Dynamic Public Blocks & 3D Exhibition Salon Wall
│   ├── lib/                          # Core Drivers (Email Service, Print Driver, Contrast Logic)
│   └── types/                        # Enterprise TypeScript Schemas & Configurations
├── prisma/
│   ├── schema.prisma                 # Declarative Schema (PostgreSQL + pgvector)
│   └── seed.ts                       # Idempotent Provisioning Engine
└── docker-compose.yml                # Production Orchestration (Web + PostgreSQL 17)
```

---

## 4. Key Platform Features & Engines

### A. 3D WebGL Exhibition Salon Wall
- **Natural Aspect Ratio Wrapping**: Canvas, gilded fillets, and outer timber frames dynamically scale to match the artwork's intrinsic aspect ratio (`naturalWidth / naturalHeight`), completely eliminating square distortion.
- **Multi-Wall Corridor Partitioning**: Configurable `maxArtworksPerWall` (default: 4) automatically splits large collections across sequential corridor walls with smooth panoramic camera panning.
- **Zero Overlay Invariant**: The 3D canvas is clean and unobstructed. Placards are mounted directly on the wall beside the painting on desktop, and cleanly hidden on mobile devices (`< 768px`) with metadata rendered below the canvas.

### B. Physical Gallery Placard & Label Generator
- **Exact Physical Dimensions**: Supports Standard Visiting Cards ($3.5 \times 2\text{ in}$ / $88.9 \times 50.8\text{ mm}$) and Museum Wall Placards ($4 \times 2.5\text{ in}$ / $101.6 \times 63.5\text{ mm}$) in both Landscape and Portrait orientations.
- **Isolated Iframe Print Driver**: Injects clean HTML/SVG into a hidden headless iframe, guaranteeing zero blank pages and eliminating admin dashboard bleed.
- **Balanced Editorial Hierarchy**: Vertical flow (Header -> Title -> Medium -> Dimensions -> Thumbnail/QR cluster -> Year -> Curatorial Notes) with an $18\text{ mm}$ safe base margin for acrylic stand clamps.
- **Cross-Module Availability**: Available directly in `/admin/artworks`, `/admin/catalogs/[id]` (e-Catalogs), and `/admin/events` (Exhibitions).

### C. Dynamic Mail Message Studio & Dispatch Engine
- **Decoupled Alert Routing**: Inbound contact and RSVP notifications route to the configured `adminAlertEmail`, never to administrative login accounts.
- **Dynamic Form Discovery**: Automatically discovers core system forms, custom page builder forms, and event registration forms.
- **Universal Tiptap WYSIWYG**: Visual editor for designing notification templates with one-click token chips (`{name}`, `{email}`, `{event_title}`, etc.).
- **Dual Delivery Logo Engine**: Employs CID inline multipart attachments (`cid:atelier-brand-logo`) for local media files alongside absolute HTTPS fallbacks, resolving broken images across all email clients.
- **Immutable Audit Logging**: Logs every outbound email to `EmailDispatchLog` with filtering, telemetry, and CSV export.

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

The platform is engineered for **100% zero-touch deployment** on any VPS running Coolify. On container boot, `docker-entrypoint.sh` automatically synchronizes PostgreSQL schemas (`prisma db push`) and provisions credentials idempotently.

### Deployment Runbook

1. **Step 1: Create Resource in Coolify**
   - In Coolify, click **+ New** -> **Git Repository**.
   - URL: `https://github.com/Savazar01/lalitakapilavai` | Branch: `main`.
2. **Step 2: Set Build Pack**
   - Select **Docker Compose** (Coolify detects root `docker-compose.yml`).
3. **Step 3: Assign Domain**
   - Enter your production domain (e.g., `https://your-domain.com`).
4. **Step 4: Configure Environment Variables**
   - Supply `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_INITIAL_PASSWORD`.
5. **Step 5: Deploy**
   - Click **Deploy**. Coolify builds the multi-stage Debian 12 container, connects services to the `coolify` network, runs the entrypoint hook, and starts the standalone Next.js server on port `3060`.

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
S3_BUCKET_NAME=your-media-vault
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
- [`.skills/ui-ux-pro-max.md`](./.skills/ui-ux-pro-max.md): Design tokens, accessibility, and luxury layout guidelines.
- [`.skills/graphify.md`](./.skills/graphify.md): Codebase and synesthetic knowledge graph extraction specifications.
- [`.skills/playwright.md`](./.skills/playwright.md): E2E automated test harness procedures.
- [`.skills/cloudflare-security.md`](./.skills/cloudflare-security.md): Edge WAF rules, CSP, and R2 private origin security.
