import claude from "@/lib/claude";

interface ContactData {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  tags?: unknown;
  interactions: {
    type: string;
    subject?: string | null;
    body?: string | null;
    createdAt: Date;
  }[];
  deals: {
    title: string;
    value: unknown;
    stage: string;
  }[];
}

export async function generateContactSummary(
  contact: ContactData
): Promise<string> {
  const interactionHistory = contact.interactions
    .map(
      (i) =>
        `- [${i.type}] ${i.subject || "No subject"} (${new Date(i.createdAt).toLocaleDateString()})`
    )
    .join("\n");

  const dealInfo = contact.deals
    .map((d) => `- ${d.title}: $${Number(d.value).toLocaleString()} (${d.stage})`)
    .join("\n");

  const tags = Array.isArray(contact.tags) ? contact.tags.join(", ") : "";

  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a CRM assistant. Generate a concise professional summary for this contact.

Contact: ${contact.name}
Email: ${contact.email}
${contact.phone ? `Phone: ${contact.phone}` : ""}
${contact.company ? `Company: ${contact.company}` : ""}
${contact.notes ? `Notes: ${contact.notes}` : ""}
${tags ? `Tags: ${tags}` : ""}

Interaction History:
${interactionHistory || "No interactions yet."}

Deals:
${dealInfo || "No deals yet."}

Write a 2-3 paragraph professional summary that highlights key relationship details, engagement patterns, and business opportunities. Be specific and actionable.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "Unable to generate summary.";
}
