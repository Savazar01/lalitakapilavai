# Skill: Shadcn UI Architecture & Design Tokens

## Overview
This skill defines the token architecture, color spaces, component elevations, and styling rules tailored for the **Lalita Kapilavai** digital portfolio. The visual aesthetic reflects traditional Indian fine art (Tanjore gold leaf, Mysore natural pigments) and classical Carnatic music heritage.

---

## 1. Aesthetic Direction: Parchment / Gold & Obsidian / Gold
The design system operates on two harmonious modes:
- **Light Mode ("Parchment & Antique Gold")**: Evokes ancient Palm-leaf manuscripts, handmade raw parchment paper, Mysore silk, temple stone, and antique gold foil.
- **Dark Mode ("Obsidian & Burnished Gold")**: Evokes sanctum sanctorum temple ambiance (Garbhagriha), polished black granite/obsidian, warm brass oil lamps (Diyas), and luminous gold relief.

---

## 2. Design Token Specifications (Tailwind CSS v4 Variables)

### Light Mode (`:root`)
```css
:root {
  /* Canvas & Surfaces */
  --background: #FBF8F1;          /* Warm Parchment */
  --foreground: #1C1814;          /* Deep Charcoal / Ink Black */
  
  --card: #FFFDF9;                /* Pure Warm Ivory */
  --card-foreground: #1C1814;
  
  --popover: #FFFFFF;
  --popover-foreground: #1C1814;
  
  /* Primary & Accents: Antique Temple Gold */
  --primary: #C69214;            /* Antique Gold */
  --primary-foreground: #FFFFFF;
  
  /* Secondary: Terracotta & Raw Silk */
  --secondary: #F2E8D5;          /* Warm Raw Silk */
  --secondary-foreground: #5C4A32;
  
  /* Muted & Borders */
  --muted: #EFE8DA;              /* Pale Sand */
  --muted-foreground: #766B5C;    /* Weathered Stone */
  
  --accent: #FAF3E0;             /* Soft Gold Glow */
  --accent-foreground: #8C6207;
  
  --destructive: #A3281E;        /* Traditional Vermilion / Sindoor Red */
  --destructive-foreground: #FFFFFF;
  
  --border: #E5D9C5;             /* Subtle Parchment Edge */
  --input: #E5D9C5;
  --ring: #C69214;
  
  /* Radii & Shadows */
  --radius: 0.5rem;
  --shadow-gold: 0 4px 20px -2px rgba(198, 146, 20, 0.15);
}
```

### Dark Mode (`.dark`)
```css
.dark {
  /* Canvas & Surfaces */
  --background: #0D0C0B;          /* Polished Obsidian / Temple Granite */
  --foreground: #F5EBE1;          /* Soft Warm Ivory */
  
  --card: #171513;                /* Deep Basalt */
  --card-foreground: #F5EBE1;
  
  --popover: #1C1A17;
  --popover-foreground: #F5EBE1;
  
  /* Primary: Burnished Temple Gold Foil */
  --primary: #E5B338;            /* Luminous 22k Gold Foil */
  --primary-foreground: #0D0C0B;
  
  /* Secondary: Teak Wood & Brass */
  --secondary: #27231F;          /* Aged Teak */
  --secondary-foreground: #E0D2C0;
  
  /* Muted & Borders */
  --muted: #24201C;
  --muted-foreground: #9C8E7E;    /* Incense Ash */
  
  --accent: #2D2720;
  --accent-foreground: #E5B338;
  
  --destructive: #CF4436;        /* Deep Kumkum / Ruby */
  --destructive-foreground: #FFFFFF;
  
  --border: #332C24;             /* Burnished Metal Trim */
  --input: #332C24;
  --ring: #E5B338;
  
  /* Radii & Shadows */
  --shadow-gold: 0 4px 25px -2px rgba(229, 179, 56, 0.25);
}
```

---

## 3. Typography Pairings
- **Headings & Classical Titles**: `Cinzel Decorative` or `Playfair Display` (evoking classical temple inscriptions and formal royal patronage).
- **Body & Captions**: `Plus Jakarta Sans` or `Geist Sans` (providing crisp, modern legibility across high-density artwork details).
- **Music Scales & Notation (Swaras)**: Monospace font (`Geist Mono`) for `S R G M P D N S`.

---

## 4. Component Rules
1. **Gold Foil Framing**:
   Cards displaying Tanjore and Mysore artworks use an inner 1px gold border with subtle radial sheen:
   `border border-primary/30 hover:border-primary/80 transition-all duration-300`
2. **Audio Visualizer**:
   Carnatic player component styled with brass and gold accents, displaying dynamic frequency waves alongside Raga scales.
3. **Buttons**:
   Primary buttons feature subtle gold-gradient sheen (`bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-stone-950 font-medium hover:brightness-110`).
