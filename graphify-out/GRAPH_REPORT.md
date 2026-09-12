# Graph Report - lalitakapilavai  (2026-09-12)

## Corpus Check
- 162 files · ~144,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 876 nodes · 2081 edges · 69 communities (53 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1a506c6`
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 47 edges
2. `cn()` - 42 edges
3. `Badge()` - 37 edges
4. `auth` - 32 edges
5. `Input` - 30 edges
6. `DialogHeader()` - 24 edges
7. `DialogContent` - 23 edges
8. `DialogTitle` - 23 edges
9. `DialogDescription` - 23 edges
10. `DialogFooter()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `TiptapRendererProps` --references--> `ContrastMode`  [EXTRACTED]
  src/components/public/tiptap-renderer.tsx → src/lib/theme-contrast.ts
- `generateMetadata()` --calls--> `getServerBaseUrl()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/get-base-url.ts
- `CatalogBackgroundLayer()` --calls--> `getPatternById()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/background-patterns.ts
- `CategoryGalleryPage()` --calls--> `cn()`  [EXTRACTED]
  src/app/(public)/gallery/[categorySlug]/page.tsx → src/lib/utils.ts
- `SectionData` --references--> `PageMatrixConfig`  [EXTRACTED]
  src/app/admin/(dashboard)/pages/[id]/builder/page.tsx → src/components/builder/page-matrix-studio.tsx

## Communities (69 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (23): AiAssistantModalProps, ArtworkBulkImportModal(), ArtworkBulkImportModalProps, ImportAuditItem, ImportAuditResult, FIELD_TYPE_LABELS, FormBlockData, FormBlockInspectorProps (+15 more)

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
Cohesion: 0.15
Nodes (14): getItemHref(), ItemLinkWrapper(), MediaGalleryBlock(), MediaGalleryBlockProps, PdfViewerBlock(), PdfViewerBlockProps, categoryBadges, categoryIcons (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/exceljs (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (28): ModernDateTimePicker(), ModernDateTimePickerProps, MONTH_NAMES, SHORT_DAYS, formatLocalizedDateTime(), getOrdinalSuffix(), SupportedCurrency, COUNTRY_CURRENCIES (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (10): AnimatedSection(), AnimatedSectionProps, DynamicPageSectionsProps, DynamicSubSectionItem, DynamicPublicPage(), generateMetadata(), getPageBySlug, PageProps (+2 more)

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
Cohesion: 0.16
Nodes (13): BackgroundPattern, getPatternById(), getPatternStyle(), getContrastTypographyClasses(), CatalogMatrixPage(), CatalogMatrixPageProps, MatrixCellSegmentData, CatalogPrintButton() (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (12): CatalogMatrixStudioProps, PageMatrixCellSegment, PageMatrixStudio(), PageMatrixStudioProps, PageTemplateItem, TiptapEditorProps, BackgroundStyleConfig, ContrastMode (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (3): { GET, POST }, auth, AuthSession

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (16): DashboardLayoutManager(), DashboardWidgetData, iconRegistry, authClient, PageConfig, PageItem, EventRsvpFormProps, Badge() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (29): CatalogBackgroundConfig, CatalogBackgroundControl(), CatalogBackgroundControlProps, HERITAGE_COLOR_PRESETS, CatalogMatrixConfig, CatalogMatrixStudio(), MatrixCellSegment, reconcileMatrixCells() (+21 more)

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (6): POST(), AiConfig, CULTURAL_SYSTEM_PROMPT, generateAiContent(), GenerateOptions, getAiConfig()

### Community 37 - "Community 37"
Cohesion: 0.23
Nodes (14): generatePresignedDownloadUrl(), generatePresignedUploadUrl(), getMediaStream(), getStorageClient(), getStorageConfig(), StorageConfig, uploadBuffer(), escapeXml() (+6 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (43): ADMIN_NAV_ITEMS, NavItemDef, Sidebar(), SidebarProps, ALLOWED_TOKENS, AllowedToken, DynamicThemeProvider(), GET() (+35 more)

### Community 40 - "Community 40"
Cohesion: 0.16
Nodes (10): metadata, metadata, metadata, metadata, DynamicPageSections(), Footer(), FooterConfig, LegalLinkItem (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.14
Nodes (18): AiAssistantModal(), CatalogTemplateItem, ArtworkSummary, EventFormData, EventFormModal(), EventFormModalProps, GalleryImageItem, COLOR_PRESETS (+10 more)

### Community 44 - "Community 44"
Cohesion: 0.14
Nodes (16): FormBlockInspector(), FormFieldConfig, columnPresets, isLightColor, PageMatrixConfig, reconcilePageMatrixCells(), PageData, SectionData (+8 more)

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (10): EditablePageHeader(), EditablePageHeaderProps, MediaUploader(), MediaUploaderProps, ECatalogListItem, ArtCategoryItem, LeadItem, statusColors (+2 more)

### Community 47 - "Community 47"
Cohesion: 0.13
Nodes (13): CustomDividerNode, DIVIDER_COLORS, DividerNodeAttributes, STYLES, THICKNESSES, WIDTHS, CustomShapeNode, PRESET_BORDERS (+5 more)

### Community 50 - "Community 50"
Cohesion: 0.23
Nodes (11): Artwork, Category, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.16
Nodes (13): TimelineMilestone, TimelineInspectorProps, BlogGridEmbed(), BlogPostSummary, iconMap, MediaBlockConfig, renderColumnBlock(), renderMarks() (+5 more)

### Community 52 - "Community 52"
Cohesion: 0.70
Nodes (4): checkAdminAuth(), DELETE(), GET(), PUT()

### Community 53 - "Community 53"
Cohesion: 0.83
Nodes (3): checkAdminAuth(), GET(), POST()

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (8): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuSubTrigger

### Community 55 - "Community 55"
Cohesion: 0.33
Nodes (3): metadata, BlogArchiveClient(), BlogPostData

### Community 58 - "Community 58"
Cohesion: 0.19
Nodes (11): DynamicFormBlock(), DynamicFormBlockProps, FormFieldConfig, MediaGalleryItem, MediaGalleryBlockData, MediaGalleryInspector(), MediaGalleryInspectorProps, Label (+3 more)

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (3): TiptapRenderer(), PageProps, PageProps

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (7): artisticBorderPresets, availableIcons, colorPresets, fontFamilies, StyleInspector(), StyleInspectorProps, Separator

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (5): ArtworkSummary, EventItem, IANA_TIMEZONES, Registration, SUPPORTED_COUNTRIES

### Community 64 - "Community 64"
Cohesion: 0.47
Nodes (5): checkAdminAuth(), DEFAULT_PAGE_SECTION_TEMPLATES, DEFAULT_TEMPLATES, GET(), POST()

## Knowledge Gaps
- **334 isolated node(s):** `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig`, `name`, `version` (+329 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 0` to `Community 32`, `Community 1`, `Community 39`, `Community 8`, `Community 7`, `Community 43`, `Community 44`, `Community 45`, `Community 47`, `Community 50`, `Community 18`, `Community 21`, `Community 54`, `Community 58`, `Community 31`, `Community 61`, `Community 62`, `Community 63`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 32`, `Community 39`, `Community 8`, `Community 43`, `Community 45`, `Community 47`, `Community 18`, `Community 51`, `Community 50`, `Community 54`, `Community 58`, `Community 61`, `Community 62`, `Community 31`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 31` to `Community 32`, `Community 1`, `Community 0`, `Community 65`, `Community 4`, `Community 7`, `Community 40`, `Community 39`, `Community 43`, `Community 44`, `Community 45`, `Community 50`, `Community 21`, `Community 58`, `Community 61`, `Community 63`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _334 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14795008912655971 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._