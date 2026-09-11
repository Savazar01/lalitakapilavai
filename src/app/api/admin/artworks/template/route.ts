import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Lalita Kapilavai Cultural Archive";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Artwork Bulk Import Template", {
      views: [{ state: "frozen", xSplit: 4, ySplit: 1 }],
      properties: { defaultRowHeight: 45 },
    });

    // 18 Standard Columns
    worksheet.columns = [
      { header: "Thumbnail", key: "thumbnail", width: 16 },
      { header: "ID", key: "id", width: 38 },
      { header: "Slug", key: "slug", width: 26 },
      { header: "Title", key: "title", width: 34 },
      { header: "Category (Parent)", key: "parentCategory", width: 24 },
      { header: "Sub-Category", key: "subCategory", width: 24 },
      { header: "Traditional School", key: "traditionalSchool", width: 22 },
      { header: "Creation Year", key: "yearCreated", width: 14 },
      { header: "Medium", key: "medium", width: 32 },
      { header: "Dimensions", key: "dimensions", width: 20 },
      { header: "Price", key: "price", width: 16 },
      { header: "Currency", key: "currency", width: 12 },
      { header: "Available for Sale", key: "isAvailable", width: 18 },
      { header: "Feature on Home", key: "showOnHomepage", width: 18 },
      { header: "Publicly Visible", key: "isActive", width: 16 },
      { header: "Sort Order", key: "sortOrder", width: 12 },
      { header: "Image URL", key: "primaryImageUrl", width: 45 },
      { header: "Artistic Commentary & Provenance", key: "description", width: 60 },
    ];

    // Format Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 34;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1C1814" },
      };
      cell.font = {
        name: "Segoe UI",
        size: 11,
        bold: true,
        color: { argb: "FFD4AF37" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FFD4AF37" } },
      };
    });

    // Sample Row 1 (Update existing or leave ID empty to create new)
    const row1 = worksheet.addRow({
      thumbnail: "(Auto-populated on export)",
      id: "", // Leave blank when creating a brand new artwork
      slug: "navaneetha-krishna-sample",
      title: "Navaneetha Krishna with Butter Pot",
      parentCategory: "Tanjore",
      subCategory: "Krishna Leela",
      traditionalSchool: "Tanjore",
      yearCreated: 2026,
      medium: "22k Gold Foil, Teakwood, Semi-Precious Gemstones",
      dimensions: "24 x 36 inches",
      price: 185000,
      currency: "INR",
      isAvailable: "TRUE",
      showOnHomepage: "TRUE",
      isActive: "TRUE",
      sortOrder: 1,
      primaryImageUrl: "/media/public/sample-krishna.jpg",
      description: "<p>Rendered in classical Thanjavur relief technique with 22k Jaipur gold leaf embossing and authentic semi-precious stone embellishments.</p>",
    });
    row1.height = 45;

    // Sample Row 2 (Mysore)
    const row2 = worksheet.addRow({
      thumbnail: "(Auto-populated on export)",
      id: "",
      slug: "sharda-devi-mysore-sample",
      title: "Goddess Sharada of Sringeri",
      parentCategory: "Mysore",
      subCategory: "Devi Iconography",
      traditionalSchool: "Mysore",
      yearCreated: 2025,
      medium: "Natural pigments, gold leaf gesso on wood panel",
      dimensions: "20 x 30 inches",
      price: 140000,
      currency: "INR",
      isAvailable: "TRUE",
      showOnHomepage: "FALSE",
      isActive: "TRUE",
      sortOrder: 2,
      primaryImageUrl: "/media/public/sample-sharada.jpg",
      description: "<p>Exquisite Mysore traditional style depicting Sharadamba seated on the Sri Chakra peetham in peaceful contemplation.</p>",
    });
    row2.height = 45;

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer = Buffer.from(fileBuffer);

    return new NextResponse(nodeBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="lalita-artworks-import-template.xlsx"',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error generating template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
