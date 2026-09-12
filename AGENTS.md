<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Operational Context & Architecture: Lalita Kapilavai Portfolio & Archive

## 1. Artist Profile & Domain Context
- **Artist**: Lalita Kapilavai
- **Disciplines**: 
  - **Traditional Indian Painter**: Master of Tanjore (Thanjavur) painting with 22k gold foil relief work, Mysore traditional painting, classical temple mural reproductions, and devotional iconography.
  - **Carnatic Classical Vocalist**: Renowned exponent of South Indian classical music, performing compositions across traditional ragas and talas (Tyagaraja, Muthuswami Dikshitar, Syama Sastri, Purandara Dasa).
- **Platform Mission**: 
  To serve as a living digital archive, high-fidelity gallery, synesthetic knowledge graph (linking visual motifs to musical ragas), client commissioning portal, and concert schedule platform.

---

## 2. Technology Stack & Modern Architectural Standards
All code in this repository strictly adheres to modern, bleeding-edge production standards:

- **Framework**: Next.js 16+ App Router (`src/` directory architecture, Turbopack, standalone output).
- **UI Runtime**: React 19 (`react@19.2.8`, `react-dom@19.2.8`) with React Server Components, Suspense, and Server Actions.
- **Language**: TypeScript 5+ in strict mode.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS theme variables — **No legacy tailwind.config.js**.
- **Component System**: Shadcn UI with high-elegance classical tokens:
  - **Light Mode**: Warm Parchment (`#FBF8F1`), Raw Silk, Antique Temple Gold (`#D4AF37`), Terracotta (`#C25E34`), and Charcoal (`#1C1814`).
  - **Dark Mode**: Deep Obsidian (`#0F0E0D`), Burnished Gold (`#E6C65A`), Rich Teak (`#2A2622`), and Soft Warm Ivory (`#F5EBE1`).
- **Database & Vector Engine**: PostgreSQL 17 with `pgvector` (`pgvector/pgvector:pg17`) running vector embeddings for semantic art/music search and multi-modal exploration.
- **ORM**: Prisma ORM with `postgresqlExtensions` preview feature enabling `vector` and `uuid-ossp` extensions.
- **Authentication**: Better-Auth for admin access, session management, and RBAC.
- **Object Storage & CDN**: Cloudflare R2 / AWS S3 with signed upload URLs and private origin protection.
- **Image Processing**: Sharp for dynamic watermarking, WebP/AVIF transformations, and thumbnail generation.
- **Testing**: Playwright for end-to-end multi-browser test automation.
- **Content Graph**: Graphify architectural node-link mapping linking Artworks to Carnatic Ragas and Compositions.
- **Container Runtime Standard**: Debian 12 Bookworm Slim (`node:22-bookworm-slim`) multi-stage build across all stages (`base`, `deps`, `builder`, `runner`) ensuring full glibc binary compatibility, high performance, and stability for Sharp (libvips), Prisma query engines, and native Node.js add-ons.

---

## 3. Core Operational Rule: Local-First Validation Before Deployment
All autonomous agents and human contributors must strictly follow the local-first validation workflow:

1. **Never push untested or unverified code to GitHub.**
2. **Local Database Verification**: Run the local PostgreSQL container with pgvector:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
3. **Lint & Typecheck**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. **Prisma Generation & Migration**:
   ```bash
   npx prisma generate
   ```
5. **Production Standalone Build Test**:
   ```bash
   npm run build
   ```
6. **Deployment Target**:
   GitHub pushes to `master`/`main` trigger automated builds on the remote VPS managed via **Coolify**, building the multi-stage `Dockerfile` and deploying the standalone Next.js container alongside PostgreSQL 17.

---

## 4. Single-Folder Local 'DevPlans' Archiving Rule
All user prompts, implementation plans, and walkthroughs MUST be persistently archived inside a single local directory: `DevPlans/`.
Autonomous agents and contributors must ensure that for every interaction, files are preserved in chronological order using consistent naming and unique tags:

### File Naming Convention & Tags:
- **Prompts**: `YYYY-MM-DD_HH-mm-ss_[PROMPT]_<topic-slug>.md`
- **Implementation Plans**: `YYYY-MM-DD_HH-mm-ss_[PLAN]_<topic-slug>.md`
- **Walkthroughs**: `YYYY-MM-DD_HH-mm-ss_[WALKTHROUGH]_<topic-slug>.md`

### Local-Only Confidentiality:
The `DevPlans/` directory is strictly ignored in `.gitignore` (`/DevPlans/`). It must never be committed to Git or pushed to remote repositories, ensuring development logs, architectural notes, and prompt transcripts remain permanently accessible exclusively on the local machine.

---

## 5. Enterprise Skill Manuals (`.skills/`)
All code generation and architectural modifications must adhere to the specialized manuals in `.skills/`:
- [`.skills/graphify.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/graphify.md): Codebase & Cultural Knowledge Graph extraction with pgvector cosine similarity.
- [`.skills/ui-ux-pro-max.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/ui-ux-pro-max.md): 99 UX guidelines, luxury cultural portfolio tokens (Ivory/Gold light mode, Obsidian/Gold dark mode), and WCAG 2.2 AAA accessibility.
- [`.skills/vercel-react-best-practices.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/vercel-react-best-practices.md): Strict RSC boundaries, parallel data fetching, zero-FOUC theme hydration, and re-render prevention.
- [`.skills/better-auth-best-practices.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/better-auth-best-practices.md): Private admin authentication with PostgreSQL adapter, `disableSignUp: true`, and middleware route guards.
- [`.skills/shadcn.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/shadcn.md): Design tokens and component elevation rules for Indian Classical fine art.
- [`.skills/cloudflare-security.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/cloudflare-security.md): Cloudflare WAF hardening, rate limits, CSP headers, and R2 media policies.
- [`.skills/playwright.md`](file:///c:/Users/AVASA/Downloads/OpenC/lalitakapilavai/.skills/playwright.md): E2E multi-browser test harness specifications.

---

## 6. Content Integrity, Dynamic CMS & Non-Destructive Operations Standards
All agent workflows and feature implementations must strictly adhere to these content and persistence protocols:

1. **Non-Destructive Idempotent Seeding (`prisma/seed.ts`)**:
   - Seeding scripts must check for existing records before writing (`prisma.<entity>.findUnique`).
   - If an entity already exists, its existing user-curated content must never be overwritten.
   - If `existing.isDeleted === true`, the seeder must skip resurrection to honor intentional administrative soft-deletions.
2. **Soft-Delete & Slug Collision Safeguards**:
   - Major content entities (`Page`, `ArtCategory`, `Artwork`, `Event`, `ECatalog`) use soft deletion (`isDeleted: true`, `isActive: false`).
   - To prevent database unique constraint collisions on `slug` while immediately freeing the canonical slug for re-creation, soft-delete operations must mutate the slug:
     ```ts
     const deletedSlug = `${existing.slug}-deleted-${Date.now()}`;
     await prisma.entity.update({
       where: { id },
       data: { isDeleted: true, isActive: false, slug: deletedSlug },
     });
     ```
3. **Zero Hardcoded Frontend Verbiage**:
   - Public pages (including `/events`, `/gallery`, `/blogs`, `/categories`, and `/`) must fetch their titles, eyebrow badges, descriptions, and section labels dynamically from the database (`Page` model and its `config Json?` column).
   - Fallback defaults must be structured so that brand-new environments render gracefully even prior to database population.
4. **Universal Visibility & Ordering Governance**:
   - Major entities must support `isActive` (public visibility toggle), `showOnHomepage` (homepage featured status), and `sortOrder` (manual display hierarchy).
   - Public queries must enforce `{ isActive: true, isDeleted: false }` filters and order by `sortOrder: "asc"`.

---

## 7. Theme-Adaptive Typography & Container Contrast Invariant
To prevent unreadable/invisible text when users toggle Dark, Light, or System themes across custom colored sections, matrix cells, hero overlays, and rich text blocks:

1. **Luminance-Aware Container Contrast Resolution (`src/lib/theme-contrast.ts`)**:
   - Containers with explicit background colors or media overlays MUST NOT blindly follow the global `.dark` / `.light` theme class.
   - Backgrounds are classified via ITU-R BT.709 perceived luminance (`0.2126*r + 0.7152*g + 0.0722*b`):
     - **Light Background** (`luminance > 140` e.g. `#FAF7F2`, `#FFFFFF`, Warm Parchment, Raw Silk): Typography scope locked to `light-bg` (`text-stone-900 prose-stone dark:text-stone-900 dark:prose-stone [color-scheme:light]`).
     - **Dark Background** (`luminance <= 140` e.g. `#1C1814`, `#0F0E0D`, Charcoal, Obsidian, Deep Teak): Typography scope locked to `dark-bg` (`text-stone-100 prose-invert dark:text-stone-100 dark:prose-invert [color-scheme:dark]`).
     - **Default / Transparent**: Inherits global theme typography (`text-foreground`).
2. **Hero Image Overlay Scrim Standard**:
   - All full-bleed hero image overlays must enforce a high-opacity dark scrim (`bg-stone-950/60` or `bg-black/50`).
   - Hero text containers must always resolve to `dark-bg`, guaranteeing crisp white/ivory typography across both light and dark modes.
3. **Tiptap Rich-Text AST & Inline Style Sanitization**:
   - In `TiptapRenderer` (`src/components/public/tiptap-renderer.tsx`), AST node elements (`h1-h4`, `p`, `ul`, `ol`, `blockquote`) must inherit `currentColor` from container typography rather than hardcoding `text-foreground`.
   - Conflicting monochrome inline color attributes (`color: #000000` on dark backgrounds or `color: #ffffff` on light backgrounds) are sanitized dynamically based on the resolved container contrast mode.
   - In `TiptapEditor` (`src/components/builder/tiptap-editor.tsx`), the editor content and toolbar reflect the container's contrast mode in real-time, preventing black-on-dark or white-on-light composition in admin studios.

---

## 8. Unified Application & Admin Theme System
- All design tokens configured via the Admin Theme Studio (`SystemSetting.themeConfig`) apply globally across BOTH the public visitor application and the Admin Portal.
- The Theme Studio controls Light Mode, Dark Mode, and Common typographic/border invariants.
- High contrast (WCAG AAA for text, WCAG AA for structural borders) must be preserved across all custom configurations.
- Badges & Status Indicators continue to use semantic colors with high contrast:
  - Published / Active: Emerald (`bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60`).
  - Homepage / Featured / AEO: Blue (`bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60`).
  - Draft / Inactive / System: Slate (`bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60`).
  - Required / Danger / Concluded: Rose (`bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60`).

---

## 9. Strict Binary Theme & Contrast Invariant (Elimination of System Mode)
To prevent theme regressions, broken light mode artifacts, or unreadable black-on-black boxes:

1. **Strict Binary Theme Engine**:
   - The application strictly uses binary theme modes: `"dark"` and `"light"`.
   - `enableSystem` is permanently set to `false`. "System" mode is eliminated globally.
   - `"dark"` is the permanent default theme on initial load and when unauthenticated (`defaultTheme="dark"`).
   - The theme switcher is a direct binary button (Sun ☀️ / Moon 🌙) toggling directly between `dark` and `light`.
2. **Surface Invariant (Zero Inverted Black-on-Black Containers)**:
   - NEVER hardcode dark backgrounds (`bg-slate-900`, `bg-[#151B26]`, `bg-[#1C1814]`, `bg-black`, `bg-stone-900`, `bg-stone-950`) on cards, panels, or navigation wrappers without a `dark:` prefix.
   - In Light mode, every card, tile, and section MUST resolve to `bg-card` (`#FFFFFF`) with visible borders (`#CBD5E1` Slate 300 1.5px boundary).
   - In Dark mode, surfaces resolve to elevated obsidian (`#151B26`) with `#1E293B` borders.
3. **Universal Typography Contrast & Readability**:
   - NEVER use pale yellow (`text-amber-100`, `text-amber-200`, `text-yellow-100`) or faint grey (`text-slate-400`, `text-stone-400`) for text or labels on light surfaces.
   - Primary titles & headings: `text-slate-900 dark:text-slate-50 font-bold`.
   - Body text, descriptions & metadata: `text-slate-800 dark:text-slate-200` (WCAG AAA compliant, > 10:1 ratio against white/pearl canvas).
   - Eyebrow tags: High-contrast `text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider`.
4. **Standardized High-Contrast Tabs & Filter Pills**:
   - Active state: High-contrast solid fill (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs`).
   - Inactive state: Distinct neutral surface (`bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 font-semibold`).
   - Eliminate transparent pills or unbordered buttons with washed-out text.
5. **Tailwind CSS v4 Class-Based Dark Variant Engine (`@custom-variant dark`)**:
   - In Tailwind CSS v4, the `dark:` variant by default compiles to `@media (prefers-color-scheme: dark)`.
   - Without `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css`, any browser running on an OS with dark mode active will ALWAYS execute `dark:` utility classes even when the user selects Light Mode in Next-Themes.
   - Therefore, `src/app/globals.css` MUST ALWAYS declare:
     ```css
     @import "tailwindcss";
     @custom-variant dark (&:where(.dark, .dark *));
     ```
   - This ensures `dark:*` classes only activate when the `.dark` class is present on the document element, completely preventing inverted dark boxes or faint text in Light Mode on dark OS environments.
