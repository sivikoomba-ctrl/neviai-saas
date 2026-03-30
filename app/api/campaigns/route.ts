import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";

export async function GET() {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const campaigns = await prisma.campaign.findMany({
      where: { orgId },
      include: { emails: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const body = await request.json();
    const { name, description, templateId } = body;

    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    const campaign = await prisma.campaign.create({
      data: { orgId, name, description: description || null, templateId: templateId || null },
    });

    return Response.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return Response.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
