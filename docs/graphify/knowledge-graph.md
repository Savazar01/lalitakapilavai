# Lalita Kapilavai — Multi-Layered Knowledge Graph

## 1. Cultural & Domain Entity Knowledge Graph

```mermaid
graph TD
    Category["ArtCategory (Tanjore, Mysore, Pahari, Pichwai, Kalamkari, etc.)"]
    Artwork["Artwork (22k Gold Foil, Dimensions, Price, Watermark, QR Code)"]
    Raga["Carnatic Raga (Arohana, Avarohana, Rasa, Melakarta)"]
    Composition["Composition (Vocal Recordings by Lalita Kapilavai)"]
    Event["Event (Exhibition, Concert, Workshop, Classroom)"]
    Registration["EventRegistration (RSVP Tickets)"]
    Lead["Lead (Physical Exhibition QR Scans & Inbound Collector Inquiries)"]

    Artwork -->|BELONGS_TO| Category
    Artwork -->|INSPIRED_BY_MOOD| Raga
    Composition -->|SET_TO_RAGA| Raga
    ArtworkOnEvent -->|EXHIBITS_IN| Event
    ArtworkOnEvent -->|DISPLAYS| Artwork
    Event -->|ACCEPTS| Registration
    Lead -->|ORIGINATED_FROM_QR| Artwork
    Lead -->|ATTENDED_EVENT| Event
```

### Relational & Cultural Topology
1. **`(Artwork)-[:BELONGS_TO]->(ArtCategory)`**:
   Categorizes masterworks under the 7 classical Indian painting schools (*Tanjore, Mysore, Pahari, Pichwai, Kalamkari, Cheriyal, Miscellaneous*).
2. **`(Artwork)-[:INSPIRED_BY_MOOD { harmonyNote: String }]->(Raga)`**:
   Bridges sacred iconographic depictions with classical Carnatic melodic frameworks (e.g. *Navaneetha Krishna* with *Kalyani* or *Madhyamavati*).
3. **`(Composition)-[:SET_TO_RAGA]->(Raga)`**:
   Associates recorded vocal recitals of the Carnatic Trinity (*Tyagaraja, Muthuswami Dikshitar, Syama Sastri*) with raga scales.
4. **`(ArtworkOnEvent)-[:EXHIBITS_IN]->(Event)`**:
   Curatorial link mapping physical gallery floor locations, virtual displays, and concert visuals.
5. **`(Lead)-[:ORIGINATED_FROM_QR { source: "EXHIBITION_QR" }]->(Artwork)`**:
   Physical exhibition floor QR codes (`/artwork/[slug]?qr=true`) direct visitors to interactive audio commentary, simultaneously creating CRM leads.

---

## 2. Codebase Architecture & Route Mapping

```mermaid
graph LR
    subgraph Public_Presentation
        Home["/ (Home Hero)"]
        Gallery["/gallery (Animated Masonry)"]
        ArtDetail["/artwork/[slug] (ArtCanvasViewer + QR Lead Modal)"]
        EventsPage["/events (Calendar & Recitals)"]
        EventDetail["/events/[slug] (Exhibition Catalog + RSVP Form)"]
        DynamicPage["/[slug] (12-Column Visual Page Renderer)"]
    end

    subgraph Admin_Control_Plane
        AdminDash["/admin (Overview Dashboard)"]
        ArtAdmin["/admin/artworks (Catalog, Vault & QR Gen)"]
        EventAdmin["/admin/events (Schedule, Timezones & Linker)"]
        PagesAdmin["/admin/pages (12-Col Visual Page Builder)"]
        NavAdmin["/admin/navigation (2-Tier Menus Console)"]
    end

    subgraph API_Endpoints
        MediaUpload["POST /api/admin/media/upload (Sharp Watermarking)"]
        ArtworkAPI["/api/admin/artworks/* (CRUD)"]
        EventAPI["/api/admin/events/* (CRUD)"]
        RSVPAPI["POST /api/events/register"]
        LeadAPI["POST /api/leads/submit"]
    end

    subgraph Database_Layer
        Prisma["Prisma ORM Client"]
        Postgres[("PostgreSQL 17 + pgvector (:5633)")]
    end

    Public_Presentation --> API_Endpoints
    Admin_Control_Plane --> API_Endpoints
    API_Endpoints --> Prisma
    Prisma --> Postgres
```
