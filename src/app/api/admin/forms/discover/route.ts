import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface DiscoveredFormItem {
  triggerType: string;
  name: string;
  source: "System Core" | "Page Builder" | "Event Registration";
  url: string;
  badge?: string;
  description?: string;
  pageSlug?: string;
  pageTitle?: string;
  eventId?: string;
  eventDate?: string;
  eventVenue?: string;
}

export interface DiscoveredFormCategory {
  id: string;
  name: string;
  description: string;
  forms: DiscoveredFormItem[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Core System Forms
    const coreForms: DiscoveredFormItem[] = [
      {
        triggerType: "contact",
        name: "Contact Form",
        source: "System Core",
        url: "/contact",
        badge: "Global",
        description: "Inbound visitor inquiries submitted via /contact or general contact buttons.",
      },
      {
        triggerType: "event_rsvp",
        name: "General Event RSVPs",
        source: "System Core",
        url: "/events",
        badge: "Events",
        description: "Default fallback RSVP confirmations across all upcoming recitals, workshops, and exhibitions.",
      },
      {
        triggerType: "custom_form",
        name: "Default Custom Form Fallback",
        source: "System Core",
        url: "/",
        badge: "Fallback",
        description: "Default fallback for any custom form blocks without a specific template.",
      },
    ];

    // 2. Scan Page Builder Forms
    const pages = await prisma.page.findMany({
      where: { isDeleted: false },
      include: {
        sections: {
          include: {
            subSections: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const pageForms: DiscoveredFormItem[] = [];
    const seenTriggers = new Set<string>();

    for (const page of pages) {
      for (const section of page.sections) {
        for (const sub of section.subSections) {
          const content = sub.content as Record<string, unknown> | null;
          if (!content) continue;

          // Check if content itself is a form block or contains blocks
          const candidateBlocks: Array<Record<string, unknown>> = [];
          if (Array.isArray(content.blocks)) {
            candidateBlocks.push(...(content.blocks as Array<Record<string, unknown>>));
          } else if (content.type === "FORM_BLOCK" || content.formTitle || content.formConfig) {
            candidateBlocks.push(content);
          }

          for (const block of candidateBlocks) {
            const isForm =
              block.type === "FORM_BLOCK" ||
              block.type === "form" ||
              block.type === "dynamic_form" ||
              !!block.formTitle ||
              !!block.formConfig;

            if (isForm) {
              const formTitle =
                (block.formTitle as string) ||
                (typeof block.formConfig === "object" && (block.formConfig as Record<string, unknown>)?.title
                  ? String((block.formConfig as Record<string, unknown>).title)
                  : "") ||
                "Inquiry Form";

              const rawBlockId = (block.id as string) || (block.blockId as string) || sub.id.slice(0, 8);
              const cleanBlockId = rawBlockId.replace(/[^a-zA-Z0-9_-]/g, "");
              const trigger = `page_form_${page.slug}_${cleanBlockId}`;

              if (!seenTriggers.has(trigger)) {
                seenTriggers.add(trigger);
                pageForms.push({
                  triggerType: trigger,
                  name: `${page.title} — ${formTitle}`,
                  source: "Page Builder",
                  url: `/${page.slug}`,
                  badge: page.isPublished ? "Published" : "Draft",
                  description: `Embedded form on page "${page.title}" (${page.slug})`,
                  pageSlug: page.slug,
                  pageTitle: page.title,
                });
              }
            }
          }
        }
      }
    }

    // 3. Scan Event Registration Forms
    const events = await prisma.event.findMany({
      where: { isDeleted: false },
      orderBy: { startDate: "asc" },
      take: 50,
    });

    const eventForms: DiscoveredFormItem[] = events.map((event) => {
      const eventDateStr = event.startDate
        ? new Date(event.startDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })
        : "Scheduled Date";

      return {
        triggerType: `event_rsvp_${event.slug}`,
        name: `RSVP: ${event.title}`,
        source: "Event Registration",
        url: `/events/${event.slug}`,
        badge: event.isPublished ? "Active Event" : "Draft Event",
        description: `Bespoke RSVP confirmation copy for "${event.title}" (${eventDateStr} • ${event.venue || event.city})`,
        eventId: event.id,
        eventDate: eventDateStr,
        eventVenue: event.venue || event.city,
      };
    });

    const categories: DiscoveredFormCategory[] = [
      {
        id: "core",
        name: "Core System Forms",
        description: "Global archive inquiries, commissions, and default RSVP handling.",
        forms: coreForms,
      },
      {
        id: "pages",
        name: "Page Builder Forms",
        description: "Forms discovered dynamically across custom visual page builder layouts.",
        forms: pageForms,
      },
      {
        id: "events",
        name: "Event Registration Forms",
        description: "Per-event RSVP attendance forms for specific exhibitions and recitals.",
        forms: eventForms,
      },
    ];

    const allForms = [...coreForms, ...pageForms, ...eventForms];

    return NextResponse.json({
      categories,
      allForms,
      totalCount: allForms.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to discover forms";
    console.error("[FormsDiscover GET] Error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
