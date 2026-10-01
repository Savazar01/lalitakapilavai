# Graph Report - lalitakapilavai  (2026-10-01)

## Corpus Check
- 224 files · ~249,676 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1425 nodes · 3354 edges · 108 communities (88 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8176262f`
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
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `Button` - 62 edges
3. `Badge()` - 46 edges
4. `auth` - 41 edges
5. `Input` - 40 edges
6. `DialogContent` - 31 edges
7. `DialogHeader()` - 31 edges
8. `DialogTitle` - 30 edges
9. `DialogDescription` - 29 edges
10. `DialogFooter()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `SpineDecoratorSlotView()` --calls--> `cn()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/utils.ts
- `CatalogSinglePlateView()` --calls--> `cn()`  [EXTRACTED]
  src/app/(public)/catalogs/[slug]/page.tsx → src/lib/utils.ts
- `CategoryGalleryPage()` --calls--> `cn()`  [EXTRACTED]
  src/app/(public)/gallery/[categorySlug]/page.tsx → src/lib/utils.ts
- `KenBurnsCanvasProps` --references--> `MediaGalleryItem`  [EXTRACTED]
  src/components/public/blocks/gallery-3d/ken-burns-canvas.tsx → src/components/public/blocks/media-gallery-block.tsx
- `InteractiveDepthCardProps` --references--> `MediaGalleryItem`  [EXTRACTED]
  src/components/public/blocks/gallery-3d/interactive-depth-card.tsx → src/components/public/blocks/media-gallery-block.tsx

## Communities (108 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (25): SortableSection(), BackgroundPattern, getPatternById(), getPatternStyle(), BackgroundStyleConfig, computeRelativeLuminance(), ContainerThemeScope, getColorSaturation() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (29): POST(), DEFAULT_EMAIL_TEMPLATES, EmailDispatchOptions, EmailLogoAttachment, encryptEmailToken(), getAbsoluteAssetUrl(), getBaseAppUrl(), getTransporter() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (45): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, class-variance-authority, clsx, countries-and-timezones, @dnd-kit/core (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (19): 2. Quickstart & Local Development, 3. High-Level Modular Architecture, 5. Quickstart & Local Development, code:block1 (SavazAI WebApps Platform), code:bash (git clone https://github.com/Savazar01/lalitakapilavai.git), code:bash (docker compose -f docker-compose.dev.yml up -d), code:bash (docker compose -f docker-compose.dev.yml exec postgres-dev p), code:bash (npx prisma generate) (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (19): categoryBadges, categoryIcons, MilestoneCard(), TimelineBlock(), TimelineBlockProps, TimelineMilestone, CATEGORY_OPTIONS, COMMON_TIMEZONES (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/exceljs (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (38): ModernDateTimePicker(), ModernDateTimePickerProps, MONTH_NAMES, SHORT_DAYS, formatCurrency(), formatLocalizedDateTime(), getOrdinalSuffix(), SupportedCurrency (+30 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (3): metadata, Navbar(), PageProps

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (16): 6. Architectural Invariants & Specialized Core Engines, A. Physical Placard Print Engine (Isolated Iframe Driver), B. 3D WebGL Exhibition Salon Wall Engine, C. Universal Email Notification & Form Dispatch Engine, D. Strict Binary Theme & Contrast Invariant, E. Multi-Tenant Brand Identity & Asset Engine (.ico Favicon & Conditional Phone), F. Dynamic Archive Subtitle & Idempotent Non-Destructive Tenant Deployment, G. Universal Contact Form & Generalized Multi-Tenant Email Templates (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (17): 1. Security Architecture Overview, 2. Content Security Policy (CSP) Configuration, 2. Content Security Policy (CSP) Directives, 3. Cloudflare WAF & Edge Rate Limiting Policies, 3. Cloudflare WAF & Edge Rate Limiting Rules, 4. Cloudflare R2 Media Security & Storage Headers, 4. Multi-Tenant Media Vault & Storage Headers, 5. Deployment Hardening Checklist (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (17): 1. Scope & Strategy, 2. Test Configuration & Environment Standards, 2. Test Suite Specifications, 3. Test Suite Specifications, code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";), code:typescript (import { test, expect } from "@playwright/test";) (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): 1. Aesthetic Direction: Parchment / Gold & Obsidian / Gold, 2. Design Token Specifications (Tailwind CSS v4 Variables), 3. Typography Pairings, 4. Component Rules, code:css (:root {), code:css (.dark {), Dark Mode (`.dark`), Light Mode (`:root`) (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): 1. Core Principles, 2. Server Configuration (`src/lib/auth.ts`), 3. Next.js Route Handler (`src/app/api/auth/[...all]/route.ts`), 4. Route Guarding Middleware (`src/middleware.ts`), 5. Superadmin Account Provisioning via Seed Script, code:typescript (import { betterAuth } from "better-auth";), code:typescript (import { auth } from "@/lib/auth";), code:typescript (import { NextResponse } from "next/server";) (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (15): 1. Scope & Domain Context, 2. Cultural & Domain Entity Relationship Graph, 2. Mandatory Agent Operating Protocol (Knowledge Graph First Invariant), 3. Cultural & Domain Entity Relationship Graph, 3. Hybrid Relational + pgvector Semantic Search, 4. Codebase Architecture Graph, 4. Hybrid Relational + pgvector Semantic Search, 5. Codebase Architecture Graph (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (16): 1. Philosophy & Aesthetic Direction, 2. Flagship Preset: "Imperial Atelier" (White-Label Theme Studio), 2. Master Color Tokens (Dual Theme), 3. Strict Binary Theme & Contrast Invariants, 3. Typography Architecture, 4. Critical UX Rules (Priority-Ranked), 4. Typography Architecture, 5. Critical UI/UX Rules (Priority-Ranked) (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): 1. Cultural & Domain Entity Knowledge Graph, 2. Codebase Architecture & Route Mapping, 3. Visual Page Builder & Luxury Framing Engine, 4. Multi-Format Media Vault & Global Interaction Architecture, code:mermaid (graph TD), code:mermaid (graph LR), code:mermaid (graph TD), code:mermaid (graph TD) (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (7): 1. React Server Component (RSC) Boundaries, 2. Server-Side Data Fetching & Deduplication, 3. Zero-FOUC Theming & Hydration Safeguards, 4. Performance & Re-render Prevention, code:typescript (export async function getDashboardData() {), code:tsx (<ThemeProvider), Skill: Vercel React & Next.js 16 Best Practices

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (19): EditablePageHeader(), EditablePageHeaderProps, ECatalogListItem, ArtCategoryItem, LeadItem, statusColors, MenuItemNode, positions (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.08
Nodes (4): { GET, POST }, auth, AuthSession, MediaVaultItem

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (28): MediaVaultDialog(), CustomDividerNode, DIVIDER_COLORS, DividerNodeAttributes, STYLES, THICKNESSES, WIDTHS, CustomImageNode (+20 more)

### Community 32 - "Community 32"
Cohesion: 0.16
Nodes (18): ArtworkBulkImportModalProps, ImportAuditItem, ImportAuditResult, EmailTiptapEditorProps, MediaVaultDialogProps, MediaVaultItem, UniversalMediaDialogProps, UniversalMediaItem (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (21): CatalogBackgroundConfig, CatalogBackgroundControl(), CatalogBackgroundControlProps, HERITAGE_COLOR_PRESETS, reconcileMatrixCells(), CatalogSinglePlateEditor(), CatalogSinglePlateEditorProps, EditorialModeSwitcher() (+13 more)

### Community 34 - "Community 34"
Cohesion: 0.83
Nodes (3): checkAdminAuth(), GET(), POST()

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (6): POST(), AiConfig, CULTURAL_SYSTEM_PROMPT, generateAiContent(), GenerateOptions, getAiConfig()

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (38): AiAssistantModalProps, DashboardLayoutManager(), DashboardWidgetData, iconRegistry, MetricsPayload, EmailTiptapEditor(), AVAILABLE_TOKENS, EmailLog (+30 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (19): clearStorageCache(), generatePresignedDownloadUrl(), generatePresignedUploadUrl(), getMediaStream(), getStorageClient(), getStorageConfig(), StorageConfig, uploadBuffer() (+11 more)

### Community 39 - "Community 39"
Cohesion: 0.05
Nodes (48): MailConfigStudio(), ADMIN_NAV_ITEMS, NavItemDef, Sidebar(), SidebarProps, ALLOWED_TOKENS, AllowedToken, DynamicThemeProvider() (+40 more)

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (13): 1. Executive Platform Overview, 2. Technology Stack & Modern Architectural Standards, 4. Full Platform Feature & Engine Catalog, 4. Key Platform Features & Engines, 6. Zero-Touch Coolify VPS Deployment, 8. Architectural Documentation & Living Governance, A. 3D WebGL Exhibition Salon Wall, A. Public Web Experiences (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (17): AiAssistantModal(), CatalogMatrixStudio(), CatalogTemplateItem, MatrixCellSegment, artisticBorderPresets, availableIcons, colorPresets, fontFamilies (+9 more)

### Community 44 - "Community 44"
Cohesion: 0.10
Nodes (30): DynamicFormConfig, MediaGalleryBlock(), MediaGalleryDisplayMode, PdfViewerBlock(), PdfViewerBlockProps, columnPresets, PageData, SubSectionData (+22 more)

### Community 45 - "Community 45"
Cohesion: 0.12
Nodes (22): DynamicFormBlock(), FormFieldConfig, HeroArchetype, HeroShowcaseBlock(), HeroShowcaseBlockProps, HotspotPin, HeroBlockData, getContrastTypographyClasses() (+14 more)

### Community 47 - "Community 47"
Cohesion: 0.11
Nodes (21): CatalogMatrixStudioProps, PageMatrixStudioProps, ASPECT_RATIOS, CustomImageAttributes, CustomImageNode, ImageAspectRatio, ImageLayoutMode, ImageViewComponent() (+13 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (12): MediaGalleryInspectorProps, EnvironmentCategory, getWallEnvironment(), WALL_ENVIRONMENTS, WallEnvironment, CameraTourStyle, ExhibitionWallBlock(), TourStep (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.14
Nodes (14): 10. Security, Better-Auth RBAC & User Administration (`/admin/users`), 11. Dynamic Admin Overview & Metric Engine (`/admin` and `src/components/admin/dashboard-layout-manager.tsx`), 1. Artwork Vault & Catalog Manager (`/admin/artworks`), 2. Museum Placard & e-Catalog Print Engine (`src/lib/print-isolated-html.ts`), 2. Museum Placard Print Studio (`src/lib/print-isolated-html.ts`), 3. Visual Drag-and-Drop Page Builder (`/admin/pages/[id]/builder`), 3. Visual Page Builder & Enterprise Landing Page Studio (`/admin/pages`), 4. Interactive e-Catalog Studio (`/admin/catalogs`) (+6 more)

### Community 50 - "Community 50"
Cohesion: 0.23
Nodes (12): ArtworkBulkImportModal(), Artwork, Category, Table, TableBody, TableCaption, TableCell, TableFooter (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.09
Nodes (31): geistMono, geistSans, generateMetadata(), metadata, POST(), ThemeProvider(), getCellValue(), parseBoolean() (+23 more)

### Community 52 - "Community 52"
Cohesion: 0.70
Nodes (4): checkAdminAuth(), DELETE(), GET(), PUT()

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (12): SectionData, PageMatrixConfig, SectionData, ArchetypeShowcaseBlock(), AnimatedSection(), AnimatedSectionProps, CatalogScrollEngine(), CatalogScrollEngineProps (+4 more)

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (13): Basic audit, code:block10 (find vulnerabilities in ./payment-processing), code:block11 (security audit this codebase (run 1 of 3)), code:block4 (security audit this codebase), code:block5 (find security vulnerabilities in ./src), code:block6 (do a security review), code:block7 (security audit this project, output to ~/audits/myapp), code:block8 (run security-audit skill on ./api, save to /tmp/audit-result) (+5 more)

### Community 55 - "Community 55"
Cohesion: 0.17
Nodes (11): cloudflare-security-audit-skill, code:javascript (// validate-findings.cjs usage), code:bash (node validate-findings.cjs path/to/findings.json), code:json ({), findings.json structure, License, Output files, Related skills (+3 more)

### Community 56 - "Community 56"
Cohesion: 0.18
Nodes (7): CategoryGalleryPage(), PageProps, metadata, Artwork, Category, GalleryGrid(), GalleryGridProps

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (9): audit_metadata, audit_date, run_number, skill_version, target_repository, confirmed_findings, coverage_notes, prior_runs_reviewed (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.16
Nodes (20): ArtworksAdminPage(), AlternatingTimelineList(), ArchetypeShowcaseBlockProps, LandingArtistMonographBlock(), LandingAvailabilityBarBlock(), LandingCorporateFeaturesBlock(), LandingCtaBlock(), LandingFaqBlock() (+12 more)

### Community 60 - "Community 60"
Cohesion: 0.22
Nodes (9): code:bash (# Run validator with verbose output), Issue: Agents go off-task, Issue: Can't reproduce PoC, Issue: Duplicate findings across runs, Issue: Missing obvious vulnerabilities, Issue: Schema validation fails, Issue: Too many false positives, Issue: Validation phase rejects everything (+1 more)

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (8): Security Audit: Detailed Vulnerability Traces & Exploitation Proofs, VULN-001: Inactive Edge Middleware Due to Misnamed File, VULN-002: Arbitrary Email Relay via Client-Supplied Recipient Parameter, VULN-003: Unauthenticated Direct Access to Master Vault Assets, VULN-004: Missing Enterprise HTTP Security Headers, VULN-005: Absence of Rate Limiting on Inbound Endpoints, VULN-006: Missing Cross-Origin / CSRF Validation, VULN-007: Insecure TLS Certificate Verification in SMTP

### Community 62 - "Community 62"
Cohesion: 0.18
Nodes (11): 1. Architectural Stack, 4. Coolify VPS Deployment Workflow, 4. Zero-Touch Coolify Deployment (via `coolify` Network), 5. Architectural Documentation & Skills, 5-Step Deployment Runbook, Automated Container Lifecycle & Idempotency Hook, code:env (# ==========================================================), code:bash (git push origin main) (+3 more)

### Community 63 - "Community 63"
Cohesion: 0.25
Nodes (8): code:bash (# Run 1: Authentication), code:yaml (# .github/workflows/security-audit.yml), code:javascript (// .skills/custom-attacks/api-gateway-abuse.md), code:json ({), Common patterns, Pattern: CI/CD integration, Pattern: Custom attack class, Pattern: Incremental coverage

### Community 64 - "Community 64"
Cohesion: 0.47
Nodes (5): checkAdminAuth(), DEFAULT_PAGE_SECTION_TEMPLATES, DEFAULT_TEMPLATES, GET(), POST()

### Community 65 - "Community 65"
Cohesion: 0.25
Nodes (8): scripts, build, dev, docker:dev, docker:dev:down, docker:dev:logs, lint, start

### Community 66 - "Community 66"
Cohesion: 0.18
Nodes (8): metadata, metadata, ExhibitionWallViewer(), Footer(), FooterConfig, LegalLinkItem, SocialLinkItem, PrivacyModalTrigger()

### Community 67 - "Community 67"
Cohesion: 0.16
Nodes (13): ArtworkMetadata, ArtworkPlacard(), ExhibitionWallBlock, getItemHref(), InteractiveDepthCard, ItemLinkWrapper(), KenBurnsCanvas, MediaGalleryBlockProps (+5 more)

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (7): computedHash, skillPath, source, sourceType, skills, cloudflare-security-audit-skill, version

### Community 69 - "Community 69"
Cohesion: 0.31
Nodes (6): ArchetypeDefinition, createArchetypePageData(), InitialSectionData, LANDING_PAGE_ARCHETYPES, LandingPageArchetypeKey, POST()

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (7): Advanced usage, code:bash (# Get changed files), code:javascript (// scripts/merge-findings.js), code:javascript (// scripts/generate-html-report.js), Custom reporting, Diff-based auditing, Integration with existing security tools

### Community 71 - "Community 71"
Cohesion: 0.29
Nodes (6): name, overrides, deepmerge-ts, eslint, private, version

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (6): 1. Trust Boundaries & Input Surfaces, 2. Data Flows & Media Pipelines, Architecture & Reconnaissance Map, Target Application, Trust Boundary 0: Unauthenticated Public Visitors, Trust Boundary 1: Authenticated Administrative Users

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (5): Adversarial validation, Core principles, Defense-in-depth gaps ≠ vulnerabilities, Only report exploitable findings, Severity = Likelihood × Impact

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (5): code:bash (# Output directory override), code:json ({), Configuration, Environment variables, Per-project configuration

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (4): Cloudflare Security Audit: Executive Report, Executive Summary, Findings Breakdown, Findings Summary Table

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (4): Attack classes, Core attack classes, Obvious-things sweep, Wildcard agent

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): code:bash (npx skills add https://github.com/cloudflare/security-audit-), code:bash (npx skills add https://github.com/cloudflare/security-audit-), code:bash (npx skills list), Installation

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (3): 1. Summary of Actions, 2. Quantitative Post-Remediation Security Posture, Validation Log - Run 2: Full Vulnerability Remediation Verification

### Community 80 - "Community 80"
Cohesion: 0.22
Nodes (10): 3. Docker Containerization & Production Build, 7. Production Environment Variables Template, code:bash (docker compose down), code:bash (# ==========================================================), code:bash (docker compose up -d --build), code:bash (docker compose ps), code:bash (curl http://localhost:3000/api/health), Full Multi-Stage Docker Build (+2 more)

### Community 82 - "Community 82"
Cohesion: 0.27
Nodes (9): ArtworkPlacardSheet(), getFontFamilyCss(), getPhysicalDimensions(), PhysicalDimensions, PlacardPrintOptions, PlacardStylingConfig, printIsolatedElement(), printIsolatedHtml() (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.21
Nodes (13): 3. Core Operational Rule: Local-First Validation Before Deployment, 3. Universal Autonomous Agent Lifecycle & Quality Gates, code:bash (# 1. Regenerate database client), code:bash (docker compose -f docker-compose.dev.yml up -d), code:bash (graphify update .), code:bash (git add .), Step 0: Knowledge Graph First Invariant (Mandatory Pre-Task Inspection), Step 1: Local-First Validation (Zero Remote Regressions) (+5 more)

### Community 86 - "Community 86"
Cohesion: 0.43
Nodes (6): DynamicPublicPage(), generateMetadata(), getPageBySlug, PageProps, generateMetadata(), PageProps

### Community 87 - "Community 87"
Cohesion: 0.16
Nodes (14): ArtworkSummary, EventDailySchedule, EventFormData, EventFormModal(), EventFormModalProps, EventRsvpConfig, EventRsvpCustomField, GalleryImageItem (+6 more)

### Community 88 - "Community 88"
Cohesion: 0.40
Nodes (4): Commands, TextOrientationExtension, TextOrientationOptions, TextOrientationType

### Community 90 - "Community 90"
Cohesion: 0.29
Nodes (8): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuSubTrigger

### Community 91 - "Community 91"
Cohesion: 0.29
Nodes (3): metadata, BlogArchiveClient(), BlogPostData

### Community 92 - "Community 92"
Cohesion: 0.18
Nodes (11): 1. Artist Profile & Domain Context, 2. Technology Stack & Modern Architectural Standards, 6. Content Integrity, Dynamic CMS & Non-Destructive Operations Standards, 7. Theme-Adaptive Typography & Container Contrast Invariant, 8. Admin Portal Dual-Theme Contrast Invariant, 8. Admin Portal Semantic Neutral Architecture (Zero Low-Contrast Yellows), 8. Unified Application & Admin Theme System, 9. Strict Binary Theme & Contrast Invariant (Elimination of System Mode) (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.11
Nodes (3): DiscoveredFormCategory, DiscoveredFormItem, globalForPrisma

### Community 94 - "Community 94"
Cohesion: 0.14
Nodes (19): CatalogMatrixConfig, SinglePlateConfigState, ECatalogCoverConfig, ECatalogCustomPageItem, ECatalogEndPageConfig, ECatalogEssayConfig, ECatalogThemeConfig, ArtworkPlateSettings (+11 more)

### Community 95 - "Community 95"
Cohesion: 0.24
Nodes (8): MediaGalleryItem, MediaGalleryBlockData, ThreeCylinderCarousel(), ThreeCylinderCarouselProps, ThreeLiquidWarp(), ThreeLiquidWarpProps, ArtworkPlacement, ExhibitionWallBlockProps

### Community 97 - "Community 97"
Cohesion: 0.40
Nodes (4): InteractiveDepthCard(), InteractiveDepthCardProps, ProtectedImage(), ProtectedImageProps

### Community 98 - "Community 98"
Cohesion: 0.16
Nodes (12): ArtworkPlacardSheetProps, CARD_BG_SWATCHES, DEFAULT_PLACARD_STYLING, EditablePlacardItem, HEADER_COLOR_SWATCHES, PlacardArtwork, TEXT_COLOR_SWATCHES, TITLE_COLOR_SWATCHES (+4 more)

### Community 99 - "Community 99"
Cohesion: 0.29
Nodes (6): 1. Platform Vision & Multi-Tenant Atelier Architecture, 2. Technology Stack & Architectural Standards, 4. Living Document Governance Invariant, 5. Enterprise Skill Manuals (`.skills/`), Operational Context & Architecture: SavazAI WebApps Platform, This is NOT the Next.js you know

### Community 101 - "Community 101"
Cohesion: 0.50
Nodes (3): decryptEmailToken(), UnsubscribePage(), UnsubscribePageProps

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (3): 4. Single-Folder Local 'DevPlans' Archiving Rule, File Naming Convention & Tags:, Local-Only Confidentiality:

## Knowledge Gaps
- **528 isolated node(s):** `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig`, `name`, `version` (+523 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 59` to `Community 0`, `Community 4`, `Community 7`, `Community 21`, `Community 31`, `Community 32`, `Community 33`, `Community 36`, `Community 39`, `Community 43`, `Community 44`, `Community 45`, `Community 48`, `Community 50`, `Community 53`, `Community 56`, `Community 66`, `Community 67`, `Community 82`, `Community 90`, `Community 95`, `Community 97`, `Community 98`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Button` connect `Community 36` to `Community 0`, `Community 4`, `Community 7`, `Community 8`, `Community 21`, `Community 31`, `Community 32`, `Community 33`, `Community 39`, `Community 43`, `Community 44`, `Community 45`, `Community 47`, `Community 48`, `Community 50`, `Community 51`, `Community 56`, `Community 87`, `Community 90`, `Community 98`, `Community 101`, `Community 103`, `Community 104`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 98` to `Community 4`, `Community 7`, `Community 8`, `Community 21`, `Community 32`, `Community 33`, `Community 36`, `Community 39`, `Community 43`, `Community 44`, `Community 45`, `Community 48`, `Community 50`, `Community 51`, `Community 56`, `Community 59`, `Community 79`, `Community 87`, `Community 103`, `Community 106`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `docker-entrypoint.sh script`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _528 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12043010752688173 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09268292682926829 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._