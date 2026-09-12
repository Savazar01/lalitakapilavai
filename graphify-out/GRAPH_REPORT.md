# Graph Report - lalitakapilavai  (2026-09-12)

## Corpus Check
- 165 files · ~149,280 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 904 nodes · 2185 edges · 54 communities (40 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `448b1cb7`
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
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 67|Community 67]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 47 edges
2. `cn()` - 45 edges
3. `Badge()` - 37 edges
4. `auth` - 32 edges
5. `Input` - 30 edges
6. `DialogHeader()` - 24 edges
7. `DialogContent` - 23 edges
8. `DialogTitle` - 23 edges
9. `DialogDescription` - 23 edges
10. `DialogFooter()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `CatalogBackgroundLayer()` --calls--> `getPatternById()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/background-patterns.ts
- `generateMetadata()` --calls--> `getServerBaseUrl()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/get-base-url.ts
- `ECatalogReaderPage()` --calls--> `getPatternById()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/background-patterns.ts
- `ECatalogReaderPage()` --calls--> `resolveContainerThemeScope()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/theme-contrast.ts
- `ECatalogReaderPage()` --calls--> `cn()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/utils.ts

## Communities (54 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (100): AiAssistantModal(), AiAssistantModalProps, ArtworkBulkImportModal(), ArtworkBulkImportModalProps, ImportAuditItem, ImportAuditResult, CatalogBackgroundConfig, CatalogBackgroundControl() (+92 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (29): geistMono, geistSans, generateMetadata(), metadata, POST(), ThemeProvider(), getCellValue(), parseBoolean() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (40): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, class-variance-authority, clsx, countries-and-timezones, @dnd-kit/core (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (34): 1. Architectural Stack, 2. Quickstart & Local Development, 3. Docker Containerization & Production Build, 4. Coolify VPS Deployment Workflow, 4. Zero-Touch Coolify Deployment (via `coolify` Network), 5. Architectural Documentation & Skills, 5-Step Deployment Runbook, Automated Container Lifecycle & Idempotency Hook (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (13): getItemHref(), ItemLinkWrapper(), MediaGalleryBlock(), MediaGalleryBlockProps, PdfViewerBlock(), PdfViewerBlockProps, AlternatingTimelineList(), CategoryGalleryPage() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/exceljs (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (40): ArtworkSummary, EventFormData, EventFormModal(), EventFormModalProps, GalleryImageItem, ModernDateTimePicker(), ModernDateTimePickerProps, MONTH_NAMES (+32 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (34): metadata, metadata, metadata, metadata, AnimatedSection(), AnimatedSectionProps, BlogArchiveClient(), BlogPostData (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (21): 1. Artist Profile & Domain Context, 2. Technology Stack & Modern Architectural Standards, 3. Core Operational Rule: Local-First Validation Before Deployment, 4. Single-Folder Local 'DevPlans' Archiving Rule, 5. Enterprise Skill Manuals (`.skills/`), 6. Content Integrity, Dynamic CMS & Non-Destructive Operations Standards, 7. Theme-Adaptive Typography & Container Contrast Invariant, 8. Admin Portal Dual-Theme Contrast Invariant (+13 more)

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
Cohesion: 0.17
Nodes (11): PageMatrixStudio(), resolveContainerContrast(), CatalogMatrixPage(), CatalogMatrixPageProps, MatrixCellSegmentData, CatalogPrintButton(), CatalogPrintButtonProps, CatalogBackgroundLayer() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.28
Nodes (12): BackgroundStyleConfig, computeRelativeLuminance(), ContainerThemeScope, getColorSaturation(), getPerceivedLuminance(), isLightColor(), NAMED_COLORS, parseColorToRgb() (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.09
Nodes (3): { GET, POST }, auth, AuthSession

### Community 31 - "Community 31"
Cohesion: 0.39
Nodes (6): escapeXml(), generateWatermarkSvg(), WatermarkOptions, WatermarkStyle, escapeXml(), POST()

### Community 32 - "Community 32"
Cohesion: 0.24
Nodes (9): PageMatrixConfig, SectionData, BACKGROUND_PATTERNS, BackgroundPattern, getPatternById(), getPatternStyle(), DynamicPageSectionsProps, DynamicSectionItem (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (6): POST(), AiConfig, CULTURAL_SYSTEM_PROMPT, generateAiContent(), GenerateOptions, getAiConfig()

### Community 37 - "Community 37"
Cohesion: 0.47
Nodes (8): generatePresignedDownloadUrl(), generatePresignedUploadUrl(), getMediaStream(), getStorageClient(), getStorageConfig(), StorageConfig, uploadBuffer(), GET()

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (44): ADMIN_NAV_ITEMS, NavItemDef, Sidebar(), SidebarProps, ALLOWED_TOKENS, AllowedToken, DynamicThemeProvider(), GET() (+36 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (22): CatalogMatrixStudioProps, categoryBadges, categoryIcons, MilestoneCard(), TimelineBlockProps, TimelineMilestone, PageMatrixStudioProps, CATEGORY_OPTIONS (+14 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (20): DynamicFormBlock(), MediaGalleryItem, FormBlockInspector(), FormFieldConfig, MediaGalleryBlockData, MediaGalleryInspector(), columnPresets, isLightColor (+12 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (20): CustomDividerNode, DIVIDER_COLORS, DividerNodeAttributes, STYLES, THICKNESSES, WIDTHS, COLOR_PRESETS, CustomImageNode (+12 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (13): FormFieldConfig, TimelineBlock(), getContrastTypographyClasses(), BlogGridEmbed(), BlogPostSummary, iconMap, MediaBlockConfig, renderColumnBlock() (+5 more)

### Community 52 - "Community 52"
Cohesion: 0.70
Nodes (4): checkAdminAuth(), DELETE(), GET(), PUT()

### Community 53 - "Community 53"
Cohesion: 0.83
Nodes (3): checkAdminAuth(), GET(), POST()

### Community 64 - "Community 64"
Cohesion: 0.47
Nodes (5): checkAdminAuth(), DEFAULT_PAGE_SECTION_TEMPLATES, DEFAULT_TEMPLATES, GET(), POST()

## Knowledge Gaps
- **336 isolated node(s):** `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig`, `name`, `version` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 0` to `Community 1`, `Community 7`, `Community 8`, `Community 39`, `Community 43`, `Community 44`, `Community 47`, `Community 18`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 32`, `Community 7`, `Community 8`, `Community 39`, `Community 43`, `Community 47`, `Community 18`, `Community 51`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 0` to `Community 1`, `Community 4`, `Community 39`, `Community 8`, `Community 7`, `Community 43`, `Community 44`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _336 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0530672708260718 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._