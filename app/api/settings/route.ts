import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";

export async function GET() {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return Response.json({ error: "Organization not found" }, { status: 404 });

    const month = new Date().toISOString().slice(0, 7);
    const usage = await prisma.usage.findUnique({
      where: { orgId_month: { orgId, month } },
    });

    return Response.json({
      org: {
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        emailQuotaMonthly: org.emailQuotaMonthly,
        aiQuotaMonthly: org.aiQuotaMonthly,
        contactQuota: org.contactQuota,
      },
      usage: {
        emailsSent: usage?.emailsSent ?? 0,
        aiCalls: usage?.aiCalls ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return Response.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    let orgId: string;
    try {
      orgId = await getOrgId();
    } catch (authErr) {
      console.error("PUT /api/settings auth error:", authErr);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    console.log("PUT /api/settings: updating org", orgId, "to name:", name.trim());

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { name: name.trim() },
    });

    console.log("PUT /api/settings: updated successfully to:", org.name);

    return Response.json({ name: org.name });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
