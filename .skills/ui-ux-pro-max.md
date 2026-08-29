# Skill: UI-UX-Pro-Max — Classical Fine Art & Music Aesthetic Standard

## 1. Philosophy & Aesthetic Direction
The design language reflects the high craftsmanship of **Lalita Kapilavai**: Tanjore 22k gold foil relief, classical Mysore painting, and Carnatic vocal mastery. The interface balances sacred classical elegance with modern web engineering, WCAG 2.2 AAA accessibility, and zero visual friction.

---

## 2. Master Color Tokens (Dual Theme)

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

## 3. Typography Architecture
- **Classical Headings (H1 - H3)**: `Playfair Display`, `Cinzel`, or `Cormorant Garamond` (evoking stone epigraphy, royal treatises, and Tanjore palace inscriptions).
- **Body & Captions**: `Plus Jakarta Sans` or `Inter` (high x-height, ultra-crisp legibility across mobile and high-DPI displays).
- **Musical Scales & Swaras**: `Geist Mono` or standard Monospace for Carnatic swara notations (`S R₂ G₃ M₁ P D₂ N₃ Ṡ`).

---

## 4. Critical UX Rules (Priority-Ranked)

### Priority 1: Accessibility (CRITICAL)
- **Color Contrast**: Enforce minimum 4.5:1 ratio for standard text and 3:1 for large display titles.
- **Focus Rings**: Distinct gold focus ring (`ring-2 ring-primary/80 ring-offset-2`) on all interactive controls.
- **Touch Targets**: Minimum `44px x 44px` on all buttons, navigation links, and theme toggle buttons.
- **Accessible Form Elements**: All inputs have associated labels, helper text, and clear error boundaries.

### Priority 2: Interaction & Responsive Layout
- **Zero-FOUC Theming**: Server and client render with matched color schemes using `next-themes` and `suppressHydrationWarning`.
- **Artwork Deep-Inspection**: Artwork image cards must preserve aspect ratios, prevent layout shifting (CLS), and deliver high-resolution zoom with dynamic watermarking.
- **Touch & Mobile Optimization**: Collapsible drawer navigation for mobile viewports (`Sheet`), sticky header with responsive elevation blur.
- **Form Feedback**: Async button loading states with spinners and explicit validation error alerts.
