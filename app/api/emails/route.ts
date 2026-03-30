import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const contactId = request.nextUrl.searchParams.get("contactId");
    const where: Record<string, unknown> = { orgId };
    if (contactId) where.contactId = contactId;

    const emails = await prisma.email.findMany({
      where,
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(emails);
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return Response.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
