import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const q = request.nextUrl.searchParams.get("q");
    const where: Record<string, unknown> = { orgId };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: { deals: true, _count: { select: { interactions: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(contacts);
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const body = await request.json();
    const { name, email, phone, company, notes, tags } = body;

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: { orgId, name, email, phone, company, notes, tags: tags || [] },
    });

    return Response.json(contact, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/contacts error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return Response.json({ error: "A contact with this email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
