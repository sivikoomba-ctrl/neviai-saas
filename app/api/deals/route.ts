import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const stage = request.nextUrl.searchParams.get("stage");
    const contactId = request.nextUrl.searchParams.get("contactId");

    const where: Record<string, unknown> = { orgId };
    if (stage) where.stage = stage;
    if (contactId) where.contactId = contactId;

    const deals = await prisma.deal.findMany({
      where,
      include: { contact: { select: { id: true, name: true, email: true, company: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(deals);
  } catch (error) {
    console.error("GET /api/deals error:", error);
    return Response.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const body = await request.json();
    const { title, value, stage, contactId } = body;

    if (!title || value === undefined || !contactId) {
      return Response.json({ error: "Title, value, and contactId are required" }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: { orgId, title, value: parseFloat(value), stage: stage || "Lead", contactId },
      include: { contact: true },
    });

    return Response.json(deal, { status: 201 });
  } catch (error) {
    console.error("POST /api/deals error:", error);
    return Response.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
