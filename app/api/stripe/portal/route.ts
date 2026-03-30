import { getOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

    if (!org.stripeCustomerId) {
      return Response.json({ error: "No billing account found" }, { status: 400 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/stripe/portal error:", error);
    return Response.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
