# Graph Report - lalitakapilavai  (2026-08-29)

## Corpus Check
- 102 files · ~57,564 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 550 nodes · 1044 edges · 43 communities (34 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e4b4d15a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 26 edges
2. `Badge()` - 22 edges
3. `auth` - 20 edges
4. `cn()` - 18 edges
5. `compilerOptions` - 16 edges
6. `Input` - 16 edges
7. `Card` - 15 edges
8. `CardTitle` - 14 edges
9. `CardContent` - 14 edges
10. `DialogHeader()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getMediaStream()`  [EXTRACTED]
  src/app/api/admin/media/vault/route.ts → src/lib/storage.ts
- `ArtworkDetailPage()` --calls--> `generateQRCodeDataUrl()`  [EXTRACTED]
  src/app/(public)/artwork/[slug]/page.tsx → src/lib/qr.ts
- `POST()` --calls--> `generateAndStoreArtworkQR()`  [EXTRACTED]
  src/app/api/admin/artworks/route.ts → src/lib/qr.ts
- `GET()` --calls--> `generateQRCodeDataUrl()`  [EXTRACTED]
  src/app/api/admin/qr/route.ts → src/lib/qr.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts

## Communities (43 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (48): columnPresets, isLightColor(), PageData, SectionData, SortableSection(), COLOR_PRESETS, FONT_SIZES, TextStyleMark (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (18): POST(), generateAndStoreArtworkQR(), generateQRCodeBuffer(), generateQRCodeDataUrl(), QRCodeOptions, generatePresignedDownloadUrl(), generatePresignedUploadUrl(), getMediaStream() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (34): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, class-variance-authority, clsx, @dnd-kit/core, @dnd-kit/sortable (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (30): 1. Architectural Stack, 2. Quickstart & Local Development, 3. Docker Containerization & Production Build, 4. Coolify VPS Deployment Workflow, 5. Architectural Documentation & Skills, code:bash (git clone https://github.com/Savazar01/lalitakapilavai.git), code:bash (docker compose down), code:bash (npm run lint) (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (25): NavItem, navItems, cn(), ArtCanvasViewerProps, Badge(), BadgeProps, badgeVariants, DropdownMenuCheckboxItem (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/node (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (34): PageProps, metadata, formatCurrency(), formatLocalizedDateTime(), getOrdinalSuffix(), SUPPORTED_CURRENCIES, SupportedCurrency, globalForPrisma (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (11): ColumnBlock, iconMap, MediaBlockConfig, renderColumnBlock(), renderMarks(), renderMediaBlock(), renderNode(), TiptapMark (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): 1. Artist Profile & Domain Context, 2. Technology Stack & Modern Architectural Standards, 3. Core Operational Rule: Local-First Validation Before Deployment, 4. Single-Folder Local 'DevPlans' Archiving Rule, 5. Enterprise Skill Manuals (`.skills/`), code:bash (docker compose -f docker-compose.dev.yml up -d), code:bash (npm run lint), code:bash (npx prisma generate) (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 1. Security Architecture Overview, 2. Content Security Policy (CSP) Configuration, 3. Cloudflare WAF & Edge Rate Limiting Rules, 4. Cloudflare R2 Media Security & Storage Headers, 5. Deployment Hardening Checklist, Bucket Access Policy, code:typescript (const cspHeader = `), code:typescript (import { S3Client, GetObjectCommand } from "@aws-sdk/client-) (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (11): 1. Scope & Strategy, 2. Test Suite Specifications, code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";), Skill: Playwright E2E Test Suite Architecture, Test Suite 1: Authentication & Admin Portal (`tests/e2e/auth.spec.ts`) (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): 1. Aesthetic Direction: Parchment / Gold & Obsidian / Gold, 2. Design Token Specifications (Tailwind CSS v4 Variables), 3. Typography Pairings, 4. Component Rules, code:css (:root {), code:css (.dark {), Dark Mode (`.dark`), Light Mode (`:root`) (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): 1. Core Principles, 2. Server Configuration (`src/lib/auth.ts`), 3. Next.js Route Handler (`src/app/api/auth/[...all]/route.ts`), 4. Route Guarding Middleware (`src/middleware.ts`), 5. Superadmin Account Provisioning via Seed Script, code:typescript (import { betterAuth } from "better-auth";), code:typescript (import { auth } from "@/lib/auth";), code:typescript (import { NextResponse } from "next/server";) (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (9): 1. Scope & Domain Context, 2. Cultural & Domain Entity Relationship Graph, 3. Hybrid Relational + pgvector Semantic Search, 4. Codebase Architecture Graph, code:mermaid (graph TD), code:sql (-- Find artworks aesthetically and thematically closest to a), code:mermaid (graph LR), Relational Topology (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): 1. Philosophy & Aesthetic Direction, 2. Master Color Tokens (Dual Theme), 3. Typography Architecture, 4. Critical UX Rules (Priority-Ranked), Dark Mode ("Sanctum Obsidian & Luminous Gold"), Light Mode ("Sacred Parchment & Antique Gold"), Priority 1: Accessibility (CRITICAL), Priority 2: Interaction & Responsive Layout (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): 1. Cultural & Domain Entity Knowledge Graph, 2. Codebase Architecture & Route Mapping, 3. Visual Page Builder & Luxury Framing Engine, 4. Multi-Format Media Vault & Global Interaction Architecture, code:mermaid (graph TD), code:mermaid (graph LR), code:mermaid (graph TD), code:mermaid (graph TD) (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (7): 1. React Server Component (RSC) Boundaries, 2. Server-Side Data Fetching & Deduplication, 3. Zero-FOUC Theming & Hydration Safeguards, 4. Performance & Re-render Prevention, code:typescript (export async function getDashboardData() {), code:tsx (<ThemeProvider), Skill: Vercel React & Next.js 16 Best Practices

### Community 18 - "Community 18"
Cohesion: 0.28
Nodes (5): geistMono, geistSans, metadata, ThemeProvider(), Toaster()

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (4): { GET, POST }, auth, AuthSession, GET()

### Community 42 - "Community 42"
Cohesion: 0.09
Nodes (29): Artwork, Category, SubSectionData, artisticBorderPresets, availableIcons, colorPresets, fontFamilies, SectionStyle (+21 more)

## Knowledge Gaps
- **228 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+223 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 0` to `Community 42`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 4` to `Community 0`, `Community 42`, `Community 7`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 42`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07889190003011141 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07741935483870968 - nodes in this community are weakly interconnected._