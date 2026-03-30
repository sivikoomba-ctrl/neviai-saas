import { prisma } from "./prisma";

interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function getOrCreateUsage(orgId: string) {
  const month = getCurrentMonth();
  return prisma.usage.upsert({
    where: { orgId_month: { orgId, month } },
    create: { orgId, month },
    update: {},
  });
}

export async function checkEmailQuota(orgId: string): Promise<QuotaResult> {
  const [usage, org] = await Promise.all([
    getOrCreateUsage(orgId),
    prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { emailQuotaMonthly: true },
    }),
  ]);

  return {
    allowed: usage.emailsSent < org.emailQuotaMonthly,
    used: usage.emailsSent,
    limit: org.emailQuotaMonthly,
  };
}

export async function checkAiQuota(orgId: string): Promise<QuotaResult> {
  const [usage, org] = await Promise.all([
    getOrCreateUsage(orgId),
    prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { aiQuotaMonthly: true },
    }),
  ]);

  return {
    allowed: usage.aiCalls < org.aiQuotaMonthly,
    used: usage.aiCalls,
    limit: org.aiQuotaMonthly,
  };
}

export async function incrementUsage(
  orgId: string,
  type: "email" | "ai"
): Promise<void> {
  const month = getCurrentMonth();
  const data =
    type === "email" ? { emailsSent: { increment: 1 } } : { aiCalls: { increment: 1 } };

  await prisma.usage.upsert({
    where: { orgId_month: { orgId, month } },
    create: {
      orgId,
      month,
      emailsSent: type === "email" ? 1 : 0,
      aiCalls: type === "ai" ? 1 : 0,
    },
    update: data,
  });
}
