import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { incrementUsage } from "@/lib/quota";
import { Resend } from "resend";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const { id } = await params;
    const email = await prisma.email.findFirst({ where: { id, orgId } });

    if (!email) return Response.json({ error: "Email not found" }, { status: 404 });
    if (email.status === "sent") return Response.json({ error: "Email already sent" }, { status: 400 });

    const bodyLines = email.body.split("\n");
    const htmlBody = bodyLines.map((line) => (line.trim() === "" ? "<br>" : line)).join("<br>");

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "NeviAI <onboarding@resend.dev>",
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      to: [email.contactEmail],
      subject: email.subject,
      text: email.body,
      html: htmlBody,
      headers: { "X-Email-Id": id },
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return Response.json({ error: `Failed to send: ${resendError.message}` }, { status: 500 });
    }

    const updated = await prisma.email.update({
      where: { id },
      data: { status: "sent", sentAt: new Date(), resendId: resendData?.id || null },
    });

    await incrementUsage(orgId, "email");

    // Log interaction to CRM contact (direct Prisma query, no cross-app HTTP call)
    if (email.contactId) {
      await prisma.interaction.create({
        data: {
          orgId,
          contactId: email.contactId,
          type: "email_sent",
          subject: email.subject,
          body: email.body,
          metadata: { emailId: email.id, campaignId: email.campaignId },
        },
      }).catch(() => {});
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to send email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
