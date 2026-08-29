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

## 4. Local Planning & Walkthrough Persistence Rule
Whenever an `implementation_plan.md` or `walkthrough.md` is created or updated in the agent artifacts directory, autonomous agents MUST always mirror and persist copies into the local repository directories:
- `plans/implementation_plan.md` (and historical timestamped copies `plans/YYYY-MM-DD_<topic>.md`)
- `walkthroughs/walkthrough.md` (and historical timestamped copies `walkthroughs/YYYY-MM-DD_<topic>.md`)

Both directories are strictly ignored in `.gitignore` (`/plans/`, `/walkthroughs/`) so they remain permanently stored and available on the local filesystem without leaking into remote Git commits.
