import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return null;
  }
  return session;
}

const DEFAULT_TEMPLATES = [
  {
    title: "Scholarly Monograph Spread",
    description: "Classic 2-column academic layout with running header, running footer, and balanced proportions.",
    targetPageType: "MAGAZINE",
    matrixRows: 1,
    matrixCols: 2,
    rowHeights: "1fr",
    colWidths: "1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>ATELIER SCHOLARLY MONOGRAPH</strong> • ICONOGRAPHY &amp; PROVENANCE</p>",
    hasFooter: true,
    footerHtml: "<p>© Lalita Kapilavai Sacred Art Archive • Traditional Indian Classical Monograph</p>",
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "gold-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FAF7F2",
    backgroundPattern: "mandala-filigree",
    patternOpacity: 0.12,
    segments: [
      {
        id: "seg-1-1",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Curatorial Discourse",
        contentHtml: "<h3>Lineage &amp; Aesthetic Philosophy</h3><p>The devotional lineage of South Indian court painters reflects centuries of sacred iconography codified under the sacred Shilpa Shastras.</p>",
      },
      {
        id: "seg-1-2",
        row: 1,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Materiality & Technique",
        contentHtml: "<h3>Embellishment with 22k Gold Leaf</h3><p>Using traditional gesso relief paste composed of powdered unboiled limestone and natural gum, each relief is burnished with authentic 22-karat gold foil.</p>",
      },
    ],
  },
  {
    title: "Hero Art with Left Spine",
    description: "2x2 asymmetric matrix featuring a full-height vertical side spine, spanned hero cell, and two supporting columns.",
    targetPageType: "MAGAZINE",
    matrixRows: 2,
    matrixCols: 2,
    rowHeights: "2fr 1fr",
    colWidths: "1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>EXHIBITION ESSAY</strong> • SACRED THEMES &amp; TRADITIONS</p>",
    hasFooter: true,
    footerHtml: "<p>Page Editorial • Curated by the Atelier of Lalita Kapilavai</p>",
    verticalSpineMode: "LEFT",
    verticalSpineWidth: "25%",
    verticalSpineHtml: "<div style='text-align:center;'><p style='font-family:serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;'><strong>THANJAVUR TRADITION</strong><br/><span style='font-size:10px;color:#D4AF37;'>22K GOLD FOIL RELIEF</span></p></div>",
    frameStyle: "gold-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FAF7F2",
    backgroundPattern: "lotus-jaali",
    patternOpacity: 0.15,
    segments: [
      {
        id: "seg-hero",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 2,
        title: "Hero Masterwork Feature",
        contentHtml: "<h2>Divine Manifestation in Sacred Geometry</h2><p class='text-muted-foreground italic'>A comprehensive scholarly reflection on central devotional figures and their ritual ornamentation.</p>",
      },
      {
        id: "seg-sub-1",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Artistic Technique",
        contentHtml: "<h4>Gesso Relief &amp; Gem Inlay</h4><p>Layers of natural mineral glue and chalk paste form the high-relief embossed substrate before gold application.</p>",
      },
      {
        id: "seg-sub-2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Patronage History",
        contentHtml: "<h4>Royal Courts &amp; Temples</h4><p>Flourishing under the patronage of the Maratha rulers of Thanjavur, works were preserved in sanctums across Tamil Nadu.</p>",
      },
    ],
  },
  {
    title: "Editorial Magazine 3x2",
    description: "3 Rows × 2 Columns publication spread with top spanning banner, twin body columns, and archival footnotes.",
    targetPageType: "MAGAZINE",
    matrixRows: 3,
    matrixCols: 2,
    rowHeights: "auto 1fr auto",
    colWidths: "1fr 1fr",
    hasHeader: false,
    headerHtml: null,
    hasFooter: true,
    footerHtml: "<p>Archival Monograph • Atelier of Lalita Kapilavai • Sacred Art Archive</p>",
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "double-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FBF8F1",
    backgroundPattern: "mandala-filigree",
    patternOpacity: 0.1,
    segments: [
      {
        id: "seg-lead",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 2,
        title: "Lead Editorial Banner",
        contentHtml: "<h1>The Living Heritage of Carnatic &amp; Tanjore Art</h1><p>Exploring the synesthetic harmony uniting visual gold relief painting with Carnatic classical ragas.</p>",
      },
      {
        id: "seg-col-1",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Visual Symphony",
        contentHtml: "<p>Each visual motif in traditional iconography corresponds to emotional rasas found in classical South Indian music.</p>",
      },
      {
        id: "seg-col-2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Raga Correspondences",
        contentHtml: "<p>From the morning radiance of Mayamalavagowla to the contemplative depth of Kalyani, color harmonies mirror modal melodies.</p>",
      },
      {
        id: "seg-foot-1",
        row: 3,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Archival Citations",
        contentHtml: "<p class='text-xs text-muted-foreground'>Manuscript archives from Tanjore Saraswathi Mahal Library.</p>",
      },
      {
        id: "seg-foot-2",
        row: 3,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Curator Remarks",
        contentHtml: "<p class='text-xs text-muted-foreground'>Handcrafted in the traditional Mysore and Thanjavur schools.</p>",
      },
    ],
  },
  {
    title: "2x2 Curatorial Grid",
    description: "Balanced 4-quadrant layout ideal for comparative analyses and multi-work expositions.",
    targetPageType: "MAGAZINE",
    matrixRows: 2,
    matrixCols: 2,
    rowHeights: "1fr 1fr",
    colWidths: "1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>QUADRANT MONOGRAPH</strong> • FOUR SACRED CORRESPONDENCES</p>",
    hasFooter: true,
    footerHtml: "<p>Curated by Lalita Kapilavai • Sacred Art Collection</p>",
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "gold-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FAF7F2",
    backgroundPattern: "mandala-filigree",
    patternOpacity: 0.12,
    segments: [
      { id: "q1", row: 1, col: 1, rowSpan: 1, colSpan: 1, title: "Quadrant 1: Dhyana Sloka", contentHtml: "<p>Meditation verse describing the iconographical form.</p>" },
      { id: "q2", row: 1, col: 2, rowSpan: 1, colSpan: 1, title: "Quadrant 2: Mineral Pigments", contentHtml: "<p>Authentic earth stones and lapis lazuli grinding methods.</p>" },
      { id: "q3", row: 2, col: 1, rowSpan: 1, colSpan: 1, title: "Quadrant 3: Tala & Rhythm", contentHtml: "<p>Rhythmic cadence in classical figure drawing and borders.</p>" },
      { id: "q4", row: 2, col: 2, rowSpan: 1, colSpan: 1, title: "Quadrant 4: Consecration", contentHtml: "<p>Prana Pratishtha ritual completion and final eye-opening ceremony.</p>" },
    ],
  },
  {
    title: "Royal Atelier Cover Feature",
    description: "Cover design with vertical title spine, central hero image plate, and archival imprint footer.",
    targetPageType: "COVER",
    matrixRows: 2,
    matrixCols: 1,
    rowHeights: "3fr 1fr",
    colWidths: "1fr",
    hasHeader: true,
    headerHtml: "<p><strong>EXHIBITION MONOGRAPH &amp; ARCHIVAL COLLECTION</strong></p>",
    hasFooter: true,
    footerHtml: "<p>Published by the Atelier of Lalita Kapilavai • Sacred Art &amp; Heritage</p>",
    verticalSpineMode: "LEFT",
    verticalSpineWidth: "22%",
    verticalSpineHtml: "<div style='text-align:center;'><p style='font-family:serif;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;'><strong>LALITA KAPILAVAI</strong><br/><span style='font-size:10px;color:#D4AF37;'>SACRED ART ARCHIVE</span></p></div>",
    frameStyle: "silk-border",
    backgroundType: "COLOR",
    backgroundColor: "#1C1814",
    backgroundPattern: "peacock-crest",
    patternOpacity: 0.15,
    segments: [
      {
        id: "cover-title-plate",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Cover Title & Feature Image",
        contentHtml: "<h1 style='text-align:center;'>DIVINE RESONANCES</h1><p style='text-align:center;font-style:italic;'>A Retrospective of Traditional 22k Gold Foil Thanjavur Masterworks</p>",
      },
      {
        id: "cover-curator-imprint",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Curatorial Imprint",
        contentHtml: "<p style='text-align:center;font-size:12px;font-family:monospace;'>CURATED BY LALITA KAPILAVAI • ATELIER MONOGRAPH SERIES</p>",
      },
    ],
  },
];

const DEFAULT_PAGE_SECTION_TEMPLATES = [
  {
    title: "Hero Showcase with Left Bio Spine",
    description: "2x2 asymmetric matrix featuring a full-height vertical side spine, spanned hero cell, and two supporting columns.",
    targetPageType: "PAGE_SECTION",
    matrixRows: 2,
    matrixCols: 2,
    rowHeights: "auto auto",
    colWidths: "1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>SACRED EXHIBITION</strong> • TRADITIONAL EMBELLISHMENT</p>",
    hasFooter: false,
    footerHtml: null,
    verticalSpineMode: "LEFT",
    verticalSpineWidth: "25%",
    verticalSpineHtml: "<div style='text-align:center;'><p style='font-family:serif;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;'><strong>ATELIER BIO</strong><br/><span style='font-size:11px;color:#D4AF37;'>LALITA KAPILAVAI</span></p><p style='font-size:12px;margin-top:8px;'>Exponent of Thanjavur 22k gold leaf iconography and classical South Indian devotional music.</p></div>",
    frameStyle: "gold-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FAF7F2",
    backgroundPattern: "lotus-jaali",
    patternOpacity: 0.15,
    segments: [
      {
        id: "web-hero",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 2,
        title: "Hero Masterwork Plate",
        contentHtml: "<h2>Divine Manifestations in Swarna Gesso</h2><p>Experience the museum-grade fidelity of 22-karat gold foil relief, embellished with authentic Jaipur gemstones and natural limestone paste.</p>",
      },
      {
        id: "web-sub-1",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Iconographical Lineage",
        contentHtml: "<h4>Gesso Embossing &amp; Foil Adhesion</h4><p>Layers of limestone powder mixed with Arabic gum create sculptured dimensional relief before hand-burnishing with 22k gold leaf.</p>",
      },
      {
        id: "web-sub-2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Carnatic Synthesis",
        contentHtml: "<h4>Raga Ragamalika &amp; Mood</h4><p>Visual devotional iconography designed in resonance with foundational Carnatic classical ragas.</p>",
      },
    ],
  },
  {
    title: "Editorial 3x2 Art Matrix",
    description: "3 Rows × 2 Columns publication spread with top spanning banner, twin body columns, and archival footnotes.",
    targetPageType: "PAGE_SECTION",
    matrixRows: 3,
    matrixCols: 2,
    rowHeights: "auto auto auto",
    colWidths: "1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>ATELIER ESSAYS</strong> • SACRED ART &amp; HISTORICAL SCHOLARSHIP</p>",
    hasFooter: true,
    footerHtml: "<p>© Atelier of Lalita Kapilavai • Sacred Art Archive</p>",
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "double-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FBF8F1",
    backgroundPattern: "mandala-filigree",
    patternOpacity: 0.1,
    segments: [
      {
        id: "web-ed-lead",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 2,
        title: "Lead Editorial Feature",
        contentHtml: "<h1>The Living Legacy of Thanjavur Painting</h1><p>Tracing four centuries of divine ornamentation from the royal courts of the Nayakas and Marathas to contemporary fine art sanctums.</p>",
      },
      {
        id: "web-ed-col1",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "The Sacred Canvas",
        contentHtml: "<h4>Unbleached Teak &amp; Mukha-Varnam</h4><p>Pure teak wood frames supporting organic canvas, prepared with unboiled limestone and paste for archival permanence.</p>",
      },
      {
        id: "web-ed-col2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Gold Burnishing",
        contentHtml: "<h4>The 22k Gold Foil Leafing</h4><p>Precision manual leafing burnished with agate stone to achieve the warm, eternal glow of royal Tanjore masterworks.</p>",
      },
      {
        id: "web-ed-sub1",
        row: 3,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Mineral Pigments",
        contentHtml: "<p>Traditional plant dyes, lapis lazuli, and mineral cinnabar providing luminous divine color fields.</p>",
      },
      {
        id: "web-ed-sub2",
        row: 3,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Patronage &amp; Honors",
        contentHtml: "<p>Commissioned by international cultural archives, royal foundations, and esteemed classical art collectors.</p>",
      },
    ],
  },
  {
    title: "Asymmetric 70:30 Curatorial Story",
    description: "Wide masterwork focal column with detailed supporting curatorial sidebar.",
    targetPageType: "PAGE_SECTION",
    matrixRows: 2,
    matrixCols: 2,
    rowHeights: "auto auto",
    colWidths: "7fr 3fr",
    hasHeader: true,
    headerHtml: "<p><strong>CURATORIAL MONOGRAPH</strong> • ASYMMETRIC STUDY</p>",
    hasFooter: false,
    footerHtml: null,
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "gold-fillet",
    backgroundType: "COLOR",
    backgroundColor: "#FAF7F2",
    backgroundPattern: "mandala-filigree",
    patternOpacity: 0.12,
    segments: [
      {
        id: "web-asym-main",
        row: 1,
        col: 1,
        rowSpan: 2,
        colSpan: 1,
        title: "Dominant Artwork Feature",
        contentHtml: "<h2>Swarna Venkateswara: Sacred Majesty</h2><p>An expansive study of traditional Tanjore iconographical proportions, Mukha-varnam gaze symmetry, and jewel-encrusted temple arches.</p>",
      },
      {
        id: "web-asym-side1",
        row: 1,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Iconography Details",
        contentHtml: "<h4>Archival Provenance</h4><p>Documenting the historic iconography and sacred dhyana slokas governing each adornment.</p>",
      },
      {
        id: "web-asym-side2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Atelier Note",
        contentHtml: "<h4>Handcrafted in Chennai</h4><p>Created exclusively by Master Artist Lalita Kapilavai over 480 hours of meticulous relief work.</p>",
      },
    ],
  },
  {
    title: "Devotional Tri-Panel with Header",
    description: "Tri-column devotional showcase with full-width top invocation header.",
    targetPageType: "PAGE_SECTION",
    matrixRows: 2,
    matrixCols: 3,
    rowHeights: "auto auto",
    colWidths: "1fr 1fr 1fr",
    hasHeader: true,
    headerHtml: "<p><strong>SACRED TRIPTYCH</strong> • DEVOTIONAL PANTHEON</p>",
    hasFooter: true,
    footerHtml: "<p>Traditional South Indian Sacred Iconography • Lalita Kapilavai Atelier</p>",
    verticalSpineMode: "NONE",
    verticalSpineWidth: "25%",
    verticalSpineHtml: null,
    frameStyle: "silk-border",
    backgroundType: "COLOR",
    backgroundColor: "#FBF8F1",
    backgroundPattern: "lotus-jaali",
    patternOpacity: 0.1,
    segments: [
      {
        id: "web-tri-invoc",
        row: 1,
        col: 1,
        rowSpan: 1,
        colSpan: 3,
        title: "Triptych Invocation",
        contentHtml: "<h2>Trimurti Devotional Manifestations</h2><p>A panoramic three-part exploration of sacred divine archetypes rendered in authentic Tanjore gesso relief.</p>",
      },
      {
        id: "web-tri-1",
        row: 2,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        title: "Panel I: Srishti (Creation)",
        contentHtml: "<h4>Lord Brahma &amp; Saraswati</h4><p>Knowledge, resonance of the Veena, and cosmic sacred geometry.</p>",
      },
      {
        id: "web-tri-2",
        row: 2,
        col: 2,
        rowSpan: 1,
        colSpan: 1,
        title: "Panel II: Sthiti (Preservation)",
        contentHtml: "<h4>Lord Vishnu &amp; Mahalakshmi</h4><p>Grace, sustenance, and abundant auspiciousness adorned with gold foil.</p>",
      },
      {
        id: "web-tri-3",
        row: 2,
        col: 3,
        rowSpan: 1,
        colSpan: 1,
        title: "Panel III: Laya (Transformation)",
        contentHtml: "<h4>Lord Shiva &amp; Parvati</h4><p>Cosmic dance of Nataraja and the eternal silence of Kailasha.</p>",
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetPageType = searchParams.get("targetPageType");

    let whereClause: Prisma.ECatalogTemplateWhereInput = {};
    const isPageSectionQuery = targetPageType === "PAGE_SECTION";

    if (isPageSectionQuery) {
      whereClause = { targetPageType: "PAGE_SECTION" };
    } else if (targetPageType) {
      whereClause = { targetPageType };
    } else {
      // Legacy e-catalog query without param: strictly exclude PAGE_SECTION to prevent contamination
      whereClause = { targetPageType: { not: "PAGE_SECTION" } };
    }

    let templates = await prisma.eCatalogTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // If no templates exist for this scoped category, seed standard defaults
    if (templates.length === 0) {
      const presetsToSeed = isPageSectionQuery ? DEFAULT_PAGE_SECTION_TEMPLATES : DEFAULT_TEMPLATES;
      for (const preset of presetsToSeed) {
        await prisma.eCatalogTemplate.create({
          data: {
            title: preset.title,
            description: preset.description,
            targetPageType: preset.targetPageType,
            matrixRows: preset.matrixRows,
            matrixCols: preset.matrixCols,
            rowHeights: preset.rowHeights,
            colWidths: preset.colWidths,
            hasHeader: preset.hasHeader,
            headerHtml: preset.headerHtml,
            hasFooter: preset.hasFooter,
            footerHtml: preset.footerHtml,
            verticalSpineMode: preset.verticalSpineMode,
            verticalSpineWidth: preset.verticalSpineWidth,
            verticalSpineHtml: preset.verticalSpineHtml,
            frameStyle: preset.frameStyle,
            backgroundType: preset.backgroundType,
            backgroundColor: preset.backgroundColor,
            backgroundPattern: preset.backgroundPattern,
            patternOpacity: preset.patternOpacity,
            segments: preset.segments as unknown as Prisma.InputJsonValue,
          },
        });
      }

      templates = await prisma.eCatalogTemplate.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching catalog templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      targetPageType = "MAGAZINE",
      matrixRows = 2,
      matrixCols = 2,
      rowHeights = "1fr 1fr",
      colWidths = "1fr 1fr",
      hasHeader = false,
      headerHtml = null,
      hasFooter = false,
      footerHtml = null,
      verticalSpineMode = "NONE",
      verticalSpineHtml = null,
      verticalSpineWidth = "25%",
      segments = [],
      frameStyle = "gold-fillet",
      backgroundType = "COLOR",
      backgroundColor = "#FAF7F2",
      backgroundPattern = null,
      patternOpacity = 0.15,
      backgroundImage = null,
      overlayOpacity = 0.2,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Template title is required" }, { status: 400 });
    }

    const template = await prisma.eCatalogTemplate.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        targetPageType,
        matrixRows: Math.min(6, Math.max(1, Number(matrixRows) || 2)),
        matrixCols: Math.min(6, Math.max(1, Number(matrixCols) || 2)),
        rowHeights: String(rowHeights || "1fr 1fr"),
        colWidths: String(colWidths || "1fr 1fr"),
        hasHeader: Boolean(hasHeader),
        headerHtml: headerHtml ? String(headerHtml) : null,
        hasFooter: Boolean(hasFooter),
        footerHtml: footerHtml ? String(footerHtml) : null,
        verticalSpineMode: ["NONE", "LEFT", "RIGHT"].includes(verticalSpineMode)
          ? verticalSpineMode
          : "NONE",
        verticalSpineHtml: verticalSpineHtml ? String(verticalSpineHtml) : null,
        verticalSpineWidth: String(verticalSpineWidth || "25%"),
        segments: segments as unknown as Prisma.InputJsonValue,
        frameStyle: String(frameStyle || "gold-fillet"),
        backgroundType: String(backgroundType || "COLOR"),
        backgroundColor: backgroundColor ? String(backgroundColor) : "#FAF7F2",
        backgroundPattern: backgroundPattern ? String(backgroundPattern) : null,
        patternOpacity: typeof patternOpacity === "number" ? patternOpacity : 0.15,
        backgroundImage: backgroundImage ? String(backgroundImage) : null,
        overlayOpacity: typeof overlayOpacity === "number" ? overlayOpacity : 0.2,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating catalog template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
