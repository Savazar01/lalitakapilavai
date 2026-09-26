# Skill: SavazAI WebApps Design System — Classical Fine Art, Cultural Archive & Spatial Exhibition Standards

## 1. Philosophy & Aesthetic Direction
The **SavazAI WebApps Design System** establishes a museum-grade visual standard for fine art master ateliers, royal cultural archives, and spatial exhibitions. The visual language marries classical craftsmanship (burnished gold leaf, natural pigments, polished hardwood framing, and archival parchment) with bleeding-edge web engineering, WCAG 2.2 AAA accessibility, and zero visual friction.

---

## 2. Flagship Preset: "Imperial Atelier" (White-Label Theme Studio)
The platform's Theme Studio provides multiple customizable aesthetic profiles. The signature default preset, **Imperial Atelier**, delivers an exquisite dual-theme experience:

### Light Mode ("Sacred Parchment & Antique Gold")
- **Canvas / Background**: `#FAF7F2` (Warm Ivory / Palm-leaf Parchment)
- **Primary Typography**: `#1A1A1A` (Deep Lampblack / Charcoal)
- **Primary Accent**: `#D4AF37` (Antique Temple Gold Foil)
- **Secondary Highlight**: `#A3281E` (Sacred Vermilion / Madder Terracotta)
- **Surface / Card**: `#FFFFFF` (Pure Silk Canvas)
- **Border / Subtle Trim**: `#E8E2D5` (Aged Parchment Edge)
- **Muted Text**: `#6E675F` (Incense Ash)

### Dark Mode ("Sanctum Obsidian & Luminous Gold")
- **Canvas / Background**: `#0D0E12` (Deep Temple Obsidian / Basalt)
- **Primary Typography**: `#EAEAEA` (Soft Luminous Ivory)
- **Primary Accent**: `#F3C64F` (Luminous 22k Gold Foil)
- **Secondary Highlight**: `#C25E34` (Warm Terracotta Ember)
- **Surface / Card**: `#16181F` (Polished Granite Surface)
- **Border / Subtle Trim**: `#2C2F3B` (Burnished Metal Border)
- **Muted Text**: `#9EA4B0` (Smoky Sandalwood)

---

## 3. Strict Binary Theme & Contrast Invariants
1. **Binary Theme Only (`enableSystem: false`)**: The platform strictly toggles between `"light"` and `"dark"`. OS-level system dark mode detection must never automatically invert colors without explicit user/curator intent.
2. **Class-Based Dark Engine**: `src/app/globals.css` enforces `@custom-variant dark (&:where(.dark, .dark *));`. All dark styles MUST use the `dark:` prefix.
3. **Placard Contrast Lock**: Physical museum placards rendered on screen must maintain invariant high-contrast dark text (`#111827`, `#374151`) on pure white paper (`#FFFFFF`), regardless of active website dark/light mode toggles.
4. **WCAG 2.2 AAA Compliance**: All UI text must maintain a minimum contrast ratio of 7:1 for body copy and 4.5:1 for large headlines.

---

## 4. Typography Architecture
- **Classical Headings (H1 - H3)**: `Playfair Display`, `Cinzel`, or `Cormorant Garamond` (evoking stone epigraphy, royal treatises, and palace inscriptions).
- **Body & Captions**: `Plus Jakarta Sans` or `Inter` (high x-height, ultra-crisp legibility across mobile and high-DPI displays).
- **Musical Scales & Swaras**: `Geist Mono` or standard Monospace for Carnatic / Hindustani musical swara notations (`S R₂ G₃ M₁ P D₂ N₃ Ṡ`).

---

## 5. Critical UI/UX Rules (Priority-Ranked)

### Priority 1: Accessibility & Contrast (CRITICAL)
- **Focus Rings**: Distinct gold focus ring (`ring-2 ring-primary/80 ring-offset-2`) on all interactive controls.
- **Touch Targets**: Minimum `44px x 44px` on all buttons, navigation links, and theme toggle buttons.
- **Accessible Form Elements**: All inputs have associated labels, helper text, and clear error boundaries.

### Priority 2: Spatial Exhibition & Media Interaction
- **Zero-FOUC Theming**: Server and client render with matched color schemes using `next-themes` and `suppressHydrationWarning`.
- **Artwork Aspect Ratio Preservation**: Canvas, matting, fillets, and outer timber frames dynamically scale to match the artwork's intrinsic aspect ratio (`naturalWidth / naturalHeight`). Never squish or crop paintings.
- **Touch & Mobile Optimization**: Collapsible drawer navigation for mobile viewports (`Sheet`), sticky header with responsive elevation blur.
- **Form Feedback**: Async button loading states with spinners and explicit validation error alerts.
