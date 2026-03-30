import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { scoreDeal } from "@/lib/ai/deal-scoring";
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
    const deal = await prisma.deal.findFirst({
      where: { id, orgId },
      include: { contact: { include: { interactions: true } } },
    });

    if (!deal) return Response.json({ error: "Deal not found" }, { status: 404 });

    let score: number;
    let advice: string;

    try {
      const result = await scoreDeal(deal);
      score = result.score;
      advice = result.advice;
      await incrementUsage(orgId, "ai");
    } catch {
      score = 50;
      if (Number(deal.value) > 50000) score += 15;
      else if (Number(deal.value) > 20000) score += 10;
      else if (Number(deal.value) > 5000) score += 5;

      const stageScores: Record<string, number> = { Lead: 0, Qualified: 10, Proposal: 20, Negotiation: 25, Won: 30, Lost: -20 };
      score += stageScores[deal.stage] || 0;

      const interactionCount = deal.contact.interactions.length;
      if (interactionCount > 5) score += 10;
      else if (interactionCount > 2) score += 5;

      score = Math.min(100, Math.max(0, score));

      if (score >= 75) advice = "Strong deal - prioritize closing.";
      else if (score >= 50) advice = "Promising deal. Increase engagement frequency.";
      else if (score >= 25) advice = "Needs nurturing. Focus on building relationship.";
      else advice = "At risk. Re-evaluate qualification.";
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: { aiScore: score, aiAdvice: advice },
    });

    return Response.json({ score: updated.aiScore, advice: updated.aiAdvice });
  } catch (error) {
    console.error("POST /api/deals/[id]/score error:", error);
    return Response.json({ error: "Failed to score deal" }, { status: 500 });
  }
}
