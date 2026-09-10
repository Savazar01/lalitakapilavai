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

export async function GET() {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let templates = await prisma.eCatalogTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    // If no templates exist in the database, seed standard presets
    if (templates.length === 0) {
      for (const preset of DEFAULT_TEMPLATES) {
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
