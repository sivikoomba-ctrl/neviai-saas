import claude from "@/lib/claude";

export async function suggestSubjects(emailBody: string): Promise<string[]> {
  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Given this email body, suggest 3 alternative subject lines. Respond ONLY with a JSON array of 3 strings.

Email body:
${emailBody.substring(0, 500)}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock) {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return ["Follow Up", "Quick Update", "Regarding Our Conversation"];
    }
  }
  return ["Follow Up", "Quick Update", "Regarding Our Conversation"];
}
