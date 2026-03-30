import claude from "@/lib/claude";

interface DealData {
  title: string;
  value: unknown;
  stage: string;
  createdAt: Date;
  contact: {
    name: string;
    company?: string | null;
    interactions: {
      type: string;
      subject?: string | null;
      createdAt: Date;
    }[];
  };
}

interface DealScore {
  score: number;
  advice: string;
}

export async function scoreDeal(deal: DealData): Promise<DealScore> {
  const interactionHistory = deal.contact.interactions
    .map(
      (i) =>
        `- [${i.type}] ${i.subject || "No subject"} (${new Date(i.createdAt).toLocaleDateString()})`
    )
    .join("\n");

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `You are a sales analyst. Score this deal from 0-100 and recommend the next best action.

Deal: ${deal.title}
Value: $${Number(deal.value).toLocaleString()}
Stage: ${deal.stage}
Days in pipeline: ${daysSinceCreation}
Contact: ${deal.contact.name}${deal.contact.company ? ` at ${deal.contact.company}` : ""}

Recent interactions with contact:
${interactionHistory || "No interactions yet."}

Respond ONLY with valid JSON in this exact format:
{"score": <number 0-100>, "advice": "<specific actionable recommendation in 1-2 sentences>"}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock) {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return { score: 50, advice: "Review deal details and schedule a follow-up with the contact." };
    }
  }
  return { score: 50, advice: "Unable to score deal. Review manually." };
}
