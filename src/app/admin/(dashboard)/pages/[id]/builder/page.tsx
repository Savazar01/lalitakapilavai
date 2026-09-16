import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VisualPageBuilder from "./builder-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function PageBuilderServerPage({ params }: BuilderPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  const page = await prisma.page.findFirst({
    where: {
      OR: [
        ...(isUuid ? [{ id }] : []),
        { slug: id },
      ],
      isDeleted: false,
    },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          subSections: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Ensure safe serialization across RSC boundary
  const serializedPage = JSON.parse(JSON.stringify(page));

  return <VisualPageBuilder initialPage={serializedPage} id={page.id} />;
}
