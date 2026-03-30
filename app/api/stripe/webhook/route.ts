import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan: "pro",
              stripeSubscriptionId: session.subscription as string,
              emailQuotaMonthly: 500,
              aiQuotaMonthly: 200,
              contactQuota: 1000,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const org = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              plan: "free",
              stripeSubscriptionId: null,
              emailQuotaMonthly: 50,
              aiQuotaMonthly: 20,
              contactQuota: 100,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status === "active") {
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (org && org.plan !== "pro") {
            await prisma.organization.update({
              where: { id: org.id },
              data: { plan: "pro" },
            });
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("POST /api/stripe/webhook error:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
