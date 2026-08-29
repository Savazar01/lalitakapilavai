# Skill: Vercel React & Next.js 16 Best Practices

## 1. React Server Component (RSC) Boundaries
- **Default to Server Components**: All layout and page files (`page.tsx`, `layout.tsx`) must remain Server Components unless client interactivity is explicitly required.
- **Push `"use client"` to the Leaves**: Isolate client components to the lowest possible nodes in the render tree (e.g., `<ThemeToggle />`, `<ArtworkZoomModal />`, `<LoginForm />`).
- **Pass Server Components as Children**: When wrapping server-rendered content with client context or animation wrappers, pass them as `children` to avoid transforming child trees into client bundles.

---

## 2. Server-Side Data Fetching & Deduplication
- **Parallel Data Fetching**:
  Fetch independent server data concurrently using `Promise.all()` to eliminate request waterfalls:
  ```typescript
  export async function getDashboardData() {
    const [artworkCount, eventCount, leadCount] = await Promise.all([
      prisma.artwork.count(),
      prisma.event.count(),
      prisma.lead.count(),
    ]);
    return { artworkCount, eventCount, leadCount };
  }
  ```
- **Request Deduplication via React `cache()`**:
  Wrap shared database queries in `cache()` when fetched across nested server layouts and pages during the same request lifecycle.
- **Minimal Serialization Payloads**:
  Select only required fields in Prisma queries (`select: { id: true, title: true, primaryImageUrl: true }`) to prevent sending heavy unneeded columns (e.g. large descriptions or embeddings) across the RSC wire.

---

## 3. Zero-FOUC Theming & Hydration Safeguards
- In `src/app/layout.tsx`, add `suppressHydrationWarning` to `<html>` to accommodate client-side theme class injection (`dark` / `light`).
- Configure `<ThemeProvider>` with:
  ```tsx
  <ThemeProvider 
    attribute="class" 
    defaultTheme="system" 
    enableSystem 
    disableTransitionOnChange
  >
    {children}
  </ThemeProvider>
  ```
- Never access `window.localStorage` or `document.documentElement` directly during initial render; rely on `useTheme()` inside client leaves with a mounted check.

---

## 4. Performance & Re-render Prevention
- Use React 19 Actions (`useActionState`, `useFormStatus`) for form submissions to eliminate boilerplate `useState` management.
- Avoid passing inline object literals or functions as props down deeply nested lists.
- Leverage Turbopack's fast HMR by keeping modular file structures and avoiding circular imports.
