import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { incrementUsage } from "@/lib/quota";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const { id } = await params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, orgId },
      include: { emails: true },
    });

    if (!campaign) return Response.json({ error: "Campaign not found" }, { status: 404 });

    const draftEmails = campaign.emails.filter((e) => e.status === "draft");
    if (draftEmails.length === 0) return Response.json({ error: "No draft emails to send" }, { status: 400 });

    const now = new Date();

    await prisma.email.updateMany({
      where: { campaignId: id, status: "draft", orgId },
      data: { status: "sent", sentAt: now },
    });

    await prisma.campaign.update({
      where: { id },
      data: { status: "sent" },
    });

    // Log interactions to CRM contacts (direct Prisma, no cross-app HTTP)
    for (const email of draftEmails) {
      if (email.contactId) {
        await prisma.interaction.create({
          data: {
            orgId,
            contactId: email.contactId,
            type: "email_sent",
            subject: email.subject,
            body: email.body,
            metadata: { emailId: email.id, campaignId: id },
          },
        }).catch(() => {});
      }
      await incrementUsage(orgId, "email").catch(() => {});
    }

    return Response.json({ message: `${draftEmails.length} emails sent`, sentCount: draftEmails.length });
  } catch (error) {
    console.error("Failed to send campaign:", error);
    return Response.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
