import claude from "@/lib/claude";
import { prisma } from "@/lib/prisma";

interface SearchResult {
  type: "contact" | "deal";
  id: string;
  title: string;
  subtitle: string;
  relevance: string;
}

export async function smartSearch(query: string, orgId: string): Promise<SearchResult[]> {
  const [contacts, deals] = await Promise.all([
    prisma.contact.findMany({
      where: { orgId },
      include: { deals: true, interactions: true },
    }),
    prisma.deal.findMany({
      where: { orgId },
      include: { contact: true },
    }),
  ]);

  const contactSummaries = contacts.map(
    (c) =>
      `CONTACT|${c.id}|${c.name}|${c.email}|${c.company || ""}|${JSON.stringify(c.tags) || ""}|deals:${c.deals.length}|interactions:${c.interactions.length}`
  );

  const dealSummaries = deals.map(
    (d) =>
      `DEAL|${d.id}|${d.title}|$${Number(d.value)}|${d.stage}|contact:${d.contact.name}`
  );

  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `You are a CRM search assistant. Given the user's query, find the most relevant contacts and deals from this data.

Query: "${query}"

Data:
${contactSummaries.join("\n")}
${dealSummaries.join("\n")}

Return ONLY a valid JSON array of results (max 10), each with:
{"type": "contact"|"deal", "id": "<the ID>", "title": "<display name>", "subtitle": "<brief context>", "relevance": "<why this matches>"}

If nothing matches, return an empty array [].`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock) {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return [];
    }
  }
  return [];
}
