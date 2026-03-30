import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { smartSearch } from "@/lib/ai/smart-search";
import { incrementUsage } from "@/lib/quota";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const q = request.nextUrl.searchParams.get("q");
    if (!q) return Response.json({ results: [] });

    let results;
    try {
      results = await smartSearch(q, orgId);
      await incrementUsage(orgId, "ai");
    } catch {
      const [contacts, deals] = await Promise.all([
        prisma.contact.findMany({
          where: { orgId, OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] },
          take: 10,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.deal.findMany({
          where: { orgId, OR: [{ title: { contains: q, mode: "insensitive" } }] },
          include: { contact: { select: { name: true } } },
          take: 10,
          orderBy: { updatedAt: "desc" },
        }),
      ]);

      results = [
        ...contacts.map((c) => ({ type: "contact" as const, id: c.id, title: c.name, subtitle: `${c.email}${c.company ? ` - ${c.company}` : ""}`, relevance: "Text match" })),
        ...deals.map((d) => ({ type: "deal" as const, id: d.id, title: d.title, subtitle: `$${Number(d.value).toLocaleString()} - ${d.stage} - ${d.contact.name}`, relevance: "Text match" })),
      ];
    }

    return Response.json({ results });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
