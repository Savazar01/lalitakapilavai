# Lalita Kapilavai — Sacred Art & Carnatic Music Archive

> Living digital archive, protected gallery, and synesthetic knowledge graph honoring the work of **Lalita Kapilavai** (Traditional Indian Painter & Carnatic Classical Vocalist).

---

## 1. Architectural Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Standalone Output)
- **UI Runtime**: React 19 (`react@19.2.8`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with custom Parchment / Obsidian & Gold design tokens
- **Database**: PostgreSQL 17 with `pgvector` extension (`pgvector/pgvector:pg17`)
- **ORM**: Prisma Client v6 with `postgresqlExtensions` preview feature
- **Auth**: Better-Auth for admin access control
- **Storage**: Cloudflare R2 / AWS S3 with signed private URLs and dynamic image watermarking (Sharp)
- **Container Runtime**: Debian 12 Bookworm Slim (`node:22-bookworm-slim`) for full glibc binary compatibility with Sharp (libvips) and Prisma native engines
- **Deployment**: Multi-stage Dockerized deployment orchestrated via Coolify on VPS

---

## 2. Quickstart & Local Development

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

### Step 2: Start Local PostgreSQL with `pgvector`
Launch the development database container (PostgreSQL 17 + pgvector on port `5432`):
```bash
docker compose -f docker-compose.dev.yml up -d
```

Verify the `vector` extension is active:
```bash
docker compose -f docker-compose.dev.yml exec postgres-dev psql -U postgres -d lalitakapilavai_dev -c "\dx"
```

### Step 3: Install Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### Step 4: Run Database Migrations / Push
```bash
npx prisma db push
```

### Step 5: Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Docker Containerization & Production Build

### Local Production Build Test
Verify the standalone Next.js compilation:
```bash
npm run build
```

### Full Multi-Stage Docker Build
Build and run the production Next.js standalone container (powered by Debian 12 `node:22-bookworm-slim`) alongside PostgreSQL 17:
```bash
docker compose up -d --build
```
Check running container health status:
```bash
docker compose ps
```

Health check verification:
```bash
curl http://localhost:3000/api/health
```

To stop containers:
```bash
docker compose down
```

---

## 4. Coolify VPS Deployment Workflow

1. **Local-First Rule**: Run tests, linter, and standalone build locally before pushing to remote:
   ```bash
   npm run lint
   npm run build
   ```
2. **Push to GitHub**:
   ```bash
   git push origin master
   ```
3. **Automated Coolify Deployment**:
   Coolify monitors the `master` branch, pulls the repository, executes the multi-stage `Dockerfile`, mounts the persistent PostgreSQL volume, and configures Traefik reverse-proxy with automated Let's Encrypt SSL certificates.

---

## 5. Architectural Documentation & Skills
- [`AGENTS.md`](./AGENTS.md): Full operational rules for AI coding agents and contributors.
- [`.skills/shadcn.md`](./.skills/shadcn.md): Design tokens for Parchment/Gold and Obsidian/Gold themes.
- [`.skills/graphify.md`](./.skills/graphify.md): Synesthetic knowledge graph linking Artworks to Carnatic Ragas.
- [`.skills/playwright.md`](./.skills/playwright.md): E2E test harness specifications.
- [`.skills/cloudflare-security.md`](./.skills/cloudflare-security.md): Cloudflare WAF, CSP, and R2 media headers.
