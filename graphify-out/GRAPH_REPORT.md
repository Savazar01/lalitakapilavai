# Graph Report - lalitakapilavai  (2026-08-30)

## Corpus Check
- 119 files · ~70,053 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 633 nodes · 1251 edges · 53 communities (40 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20c2e975`
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
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 30 edges
2. `Badge()` - 25 edges
3. `auth` - 24 edges
4. `cn()` - 19 edges
5. `Input` - 18 edges
6. `Card` - 17 edges
7. `compilerOptions` - 16 edges
8. `CardTitle` - 16 edges
9. `CardContent` - 16 edges
10. `DialogHeader()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `generateAndStoreArtworkQR()`  [EXTRACTED]
  src/app/api/admin/artworks/route.ts → src/lib/qr.ts
- `POST()` --calls--> `uploadBuffer()`  [EXTRACTED]
  src/app/api/admin/media/upload/route.ts → src/lib/storage.ts
- `GET()` --calls--> `getMediaStream()`  [EXTRACTED]
  src/app/api/admin/media/vault/route.ts → src/lib/storage.ts
- `GET()` --calls--> `generateQRCodeDataUrl()`  [EXTRACTED]
  src/app/api/admin/qr/route.ts → src/lib/qr.ts
- `Badge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/badge.tsx → src/lib/utils.ts

## Communities (53 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (63): AiAssistantModal(), AiAssistantModalProps, DashboardLayoutManager(), DashboardWidgetData, iconRegistry, Artwork, Category, COLOR_PRESETS (+55 more)

### Community 1 - "Community 1"
Cohesion: 0.47
Nodes (8): generatePresignedDownloadUrl(), generatePresignedUploadUrl(), getMediaStream(), getStorageClient(), getStorageConfig(), StorageConfig, uploadBuffer(), GET()

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, class-variance-authority, clsx, @dnd-kit/core, @dnd-kit/sortable (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (34): 1. Architectural Stack, 2. Quickstart & Local Development, 3. Docker Containerization & Production Build, 4. Coolify VPS Deployment Workflow, 4. Zero-Touch Coolify Deployment (via `coolify` Network), 5. Architectural Documentation & Skills, 5-Step Deployment Runbook, Automated Container Lifecycle & Idempotency Hook (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (18): NavItem, navItems, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/node (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (18): formatCurrency(), formatLocalizedDateTime(), getOrdinalSuffix(), SUPPORTED_CURRENCIES, SupportedCurrency, generateQRCodeDataUrl(), ArtCanvasViewer(), EventRsvpForm() (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (13): BlogGridEmbed(), BlogPostSummary, ColumnBlock, iconMap, MediaBlockConfig, renderColumnBlock(), renderMarks(), renderMediaBlock() (+5 more)

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

### Community 21 - "Community 21"
Cohesion: 0.21
Nodes (11): AnimatedSection(), AnimatedSectionProps, DynamicPageSectionsProps, DynamicSectionItem, DynamicSubSectionItem, DynamicPublicPage(), generateMetadata(), getPageBySlug (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (3): { GET, POST }, auth, AuthSession

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (6): POST(), AiConfig, CULTURAL_SYSTEM_PROMPT, generateAiContent(), GenerateOptions, getAiConfig()

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (24): artisticBorderPresets, availableIcons, colorPresets, fontFamilies, StyleInspectorProps, cn(), AiConfig, EmailConfig (+16 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (9): metadata, metadata, Footer(), FooterConfig, LegalLinkItem, SocialLinkItem, Navbar(), PageProps (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (5): PageProps, metadata, Artwork, Category, GalleryGrid()

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (8): scripts, build, dev, docker:dev, docker:dev:down, docker:dev:logs, lint, start

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (12): columnPresets, isLightColor(), PageData, SectionData, SortableSection(), SubSectionData, SectionStyle, StyleInspector() (+4 more)

### Community 44 - "Community 44"
Cohesion: 0.43
Nodes (4): POST(), generateAndStoreArtworkQR(), generateQRCodeBuffer(), QRCodeOptions

### Community 45 - "Community 45"
Cohesion: 0.48
Nodes (5): escapeXml(), generateWatermarkSvg(), WatermarkOptions, escapeXml(), POST()

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (5): name, overrides, deepmerge-ts, private, version

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (4): metadata, BlogArchiveClient(), BlogPostData, DynamicPageSections()

## Knowledge Gaps
- **259 isolated node(s):** `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig`, `name`, `version` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 0` to `Community 4`, `Community 37`, `Community 36`, `Community 7`, `Community 39`, `Community 43`, `Community 49`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 0` to `Community 4`, `Community 37`, `Community 36`, `Community 39`, `Community 7`, `Community 43`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 36` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07262882748319642 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06890756302521009 - nodes in this community are weakly interconnected._