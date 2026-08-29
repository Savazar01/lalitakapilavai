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

### Step 2: Start Local Full-Stack (Web + PostgreSQL)
Launch both the development database (PostgreSQL 17 + pgvector on port `5633`) and the Next.js dev server on port `3060`:
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

### Step 4: Run Database Migrations & Seed Default Data
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 5: Admin Control Center & Default Credentials
The platform provides a secured, private administration desk with Better-Auth authentication (public registration disabled).

- **Admin Login URL**: [http://localhost:3060/admin/login](http://localhost:3060/admin/login)
- **Superadmin Email**: `admin@lalitakapilavai.com`
- **Default Password**: `AdminPassword2026!` (configured via `ADMIN_INITIAL_PASSWORD` in `.env`)
- **Admin Dashboard**: [http://localhost:3060/admin](http://localhost:3060/admin)
- **Public Portal**: [http://localhost:3060](http://localhost:3060)

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

## 4. Zero-Touch Coolify Deployment (via `coolify` Network)

The platform is engineered for **100% zero-touch deployment** on any VPS running Coolify. On container boot, `docker-entrypoint.sh` automatically synchronizes PostgreSQL schemas (`prisma db push`) and provisions the Superadmin account using your configured environment variables. No manual database setup or terminal intervention is required.

### 5-Step Deployment Runbook

1. **Step 1: Create New Resource in Coolify**
   - In your Coolify dashboard, navigate to your Project/Environment.
   - Click **+ New** -> **Git Repository**.
   - Repository URL: `https://github.com/Savazar01/lalitakapilavai`
   - Branch: `main`.

2. **Step 2: Select Build Pack**
   - Set **Build Pack** to **Docker Compose**.
   - Coolify will automatically detect the root `docker-compose.yml`.

3. **Step 3: Assign Production Domain**
   - In the **Domains** field, enter your production domain (e.g., `https://your-domain.com`).
   - Coolify's Traefik reverse proxy will route public HTTPS traffic directly to the `web` container on exposed port `3060` via the shared `coolify` external network.

4. **Step 4: Configure Environment Variables**
   - In the Coolify **Environment Variables** tab, paste the complete production configuration template below.
   - Set your custom `POSTGRES_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, and `BETTER_AUTH_SECRET`.

5. **Step 5: Click Deploy**
   - Click **Deploy**. Coolify builds the multi-stage Debian 12 container, connects both database and web services to the `coolify` network, runs the automated entrypoint hook (`prisma db push` + idempotent seed), and launches the Next.js production server.

---

### Complete Production Environment Variables Template

```env
# ==============================================================================
# PRODUCTION ENVIRONMENT VARIABLES (COOLIFY DOCKER-COMPOSE)
# ==============================================================================

# PostgreSQL Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=generate_strong_database_password_here
POSTGRES_DB=lalitakapilavai_prod

# Core Application URLs & Ports
NODE_ENV=production
PORT=3060
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Better-Auth Private Authentication & Dynamic Superadmin Provisioning
BETTER_AUTH_SECRET=generate_32_byte_hex_string
BETTER_AUTH_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_NAME=Lalita Kapilavai Admin
ADMIN_INITIAL_PASSWORD=YourStrongInitialAdminPassword2026!

# Cloudflare R2 / AWS S3 Media Storage Vault
STORAGE_PROVIDER=r2
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET_NAME=lalita-art-vault
S3_ACCESS_KEY_ID=your_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key
S3_PUBLIC_DOMAIN=https://media.your-domain.com
S3_REGION=auto

# Copyright Watermark Controls
WATERMARK_TEXT=© Lalita Kapilavai | lalitakapilavai.com
WATERMARK_OPACITY=0.75
```

---

### Automated Container Lifecycle & Idempotency Hook

When the `lalita_web_prod` container boots up, `docker-entrypoint.sh` executes the following sequence before starting the web server:
1. **Schema Synchronization**: Runs `prisma db push --skip-generate --accept-data-loss` to guarantee all tables, columns, and pgvector extension bindings are active.
2. **Idempotent Superadmin Provisioning**: Runs `prisma/seed.ts`. If the user with `ADMIN_EMAIL` does not exist, it securely hashes `ADMIN_INITIAL_PASSWORD` and provisions the Superadmin. If the account already exists, **it preserves existing credentials without overwriting**, allowing administrators to change passwords safely via the admin panel.
3. **Idempotent Asset Seeding**: Automatically provisions default art categories and navigation structures if not already present.
4. **Server Launch**: Executes `node server.js` to serve high-performance SSR and dynamic routes on port `3060`.

---

## 5. Architectural Documentation & Skills
- [`AGENTS.md`](./AGENTS.md): Full operational rules for AI coding agents and contributors.
- [`.skills/shadcn.md`](./.skills/shadcn.md): Design tokens for Parchment/Gold and Obsidian/Gold themes.
- [`.skills/graphify.md`](./.skills/graphify.md): Synesthetic knowledge graph linking Artworks to Carnatic Ragas.
- [`.skills/playwright.md`](./.skills/playwright.md): E2E test harness specifications.
- [`.skills/cloudflare-security.md`](./.skills/cloudflare-security.md): Cloudflare WAF, CSP, and R2 media headers.
