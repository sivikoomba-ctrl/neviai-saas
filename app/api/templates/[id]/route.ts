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
    const template = await prisma.template.findFirst({ where: { id, orgId } });
    if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
    return Response.json(template);
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return Response.json({ error: "Failed to fetch template" }, { status: 500 });
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
    const existing = await prisma.template.findFirst({ where: { id, orgId } });
    if (!existing) return Response.json({ error: "Template not found" }, { status: 404 });

    const body = await request.json();
    const { name, subject, body: templateBody, category, variables } = body;

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(templateBody !== undefined && { body: templateBody }),
        ...(category !== undefined && { category }),
        ...(variables !== undefined && { variables }),
      },
    });

    return Response.json(template);
  } catch (error) {
    console.error("Failed to update template:", error);
    return Response.json({ error: "Failed to update template" }, { status: 500 });
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
    const existing = await prisma.template.findFirst({ where: { id, orgId } });
    if (!existing) return Response.json({ error: "Template not found" }, { status: 404 });

    await prisma.template.delete({ where: { id } });
    return Response.json({ message: "Template deleted" });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return Response.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
