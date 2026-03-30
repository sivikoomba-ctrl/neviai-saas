import { getOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        name: org.name,
        metadata: { orgId: org.id },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
      metadata: { orgId },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/stripe/checkout error:", error);
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
