import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const { id } = await params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, orgId },
      include: { emails: { orderBy: { createdAt: "desc" } } },
    });

    if (!campaign) return Response.json({ error: "Campaign not found" }, { status: 404 });
    return Response.json(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return Response.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const { id } = await params;
    const existing = await prisma.campaign.findFirst({ where: { id, orgId } });
    if (!existing) return Response.json({ error: "Campaign not found" }, { status: 404 });

    const body = await request.json();
    const { name, description, status, templateId } = body;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(templateId !== undefined && { templateId }),
      },
    });

    return Response.json(campaign);
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return Response.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const { id } = await params;
    const existing = await prisma.campaign.findFirst({ where: { id, orgId } });
    if (!existing) return Response.json({ error: "Campaign not found" }, { status: 404 });

    await prisma.campaign.delete({ where: { id } });
    return Response.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return Response.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
