# Architecture & Reconnaissance Map

## Target Application
- **Platform**: Lalita Kapilavai Digital Archive & Fine Art Portfolio
- **Runtime**: Next.js 16 (App Router) + React 19 on Node.js 22 (Debian Bookworm Slim)
- **Database**: PostgreSQL 17 with `pgvector`
- **Authentication**: Better-Auth (Cookie-based session tokens)
- **Object Storage**: Cloudflare R2 / AWS S3 with Local Filesystem fallback
- **Image Pipeline**: Sharp + SVG vector overlays

---

## 1. Trust Boundaries & Input Surfaces

### Trust Boundary 0: Unauthenticated Public Visitors
- **Input Surfaces**:
  - `GET /` (Homepage)
  - `GET /gallery/*` (Artworks & Categories)
  - `GET /catalogs/*` (Curatorial e-Catalogs)
  - `GET /events/*` (Exhibitions & Concerts)
  - `GET /artwork/*` (Masterwork Detail & Canvas Viewer)
  - `GET /media/*` (Public media assets & image proxy)
  - `POST /api/forms/submit` (General contact & artwork commission forms)
  - `POST /api/events/register` (Exhibition attendee RSVP & ticketing)
  - `POST /api/leads/submit` (Floor QR scanner lead captures)

### Trust Boundary 1: Authenticated Administrative Users
- **Session Mechanism**: `better-auth.session_token` / `__Secure-better-auth.session_token`
- **Input Surfaces**:
  - `/admin/*` (Theme Studio, Settings, Artworks, Catalogs, Events, Leads, Users)
  - `/api/admin/*` (CRUD operations on Artworks, Catalogs, Media Vault, System Settings)

---

## 2. Data Flows & Media Pipelines
1. **Master Artwork Ingestion**:
   Admin Upload -> `POST /api/admin/media/upload` -> Sharp Image Transcoding (HEIC/TIFF -> WebP) ->
   - Unwatermarked Master Asset -> Protected Vault (`public/media/vault/` or S3/R2 `vault/`)
   - SVG Watermarked Public Asset -> Public Media (`public/media/public/` or S3/R2 `public/`)
2. **Public Image Consumption**:
   Browser -> `GET /media/*` -> `/api/media/[...path]/route.ts` -> File Buffer Streaming.
3. **Inbound Lead / RSVP Notifications**:
   Public Visitor -> `POST /api/forms/submit` -> Prisma Lead Record -> Nodemailer SMTP Transport -> Admin Inbox.
