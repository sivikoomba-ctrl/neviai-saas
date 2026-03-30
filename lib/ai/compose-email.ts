import claude from "@/lib/claude";

interface ComposeInput {
  prompt: string;
  tone: string;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
}

interface ComposeResult {
  subject: string;
  body: string;
}

export async function composeEmail(input: ComposeInput): Promise<ComposeResult> {
  const toneGuide: Record<string, string> = {
    professional: "Write in a professional, business-appropriate tone.",
    friendly: "Write in a warm, friendly but still professional tone.",
    formal: "Write in a very formal, traditional business letter tone.",
    casual: "Write in a casual, conversational tone while remaining respectful.",
  };

  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are an email writing assistant. Write an email that sounds like a real person wrote it — NOT a marketing email.

IMPORTANT RULES for inbox delivery:
- Write like a human, not a marketer
- Keep the subject line short and personal
- No bullet points or formatted lists — use plain sentences
- No promotional language
- Keep it concise — 3-5 short paragraphs max
- Use a simple greeting and sign-off

User's request: "${input.prompt}"

Tone: ${toneGuide[input.tone] || toneGuide.professional}

${input.contactName ? `Recipient: ${input.contactName}` : ""}
${input.contactEmail ? `Recipient email: ${input.contactEmail}` : ""}
${input.contactCompany ? `Recipient company: ${input.contactCompany}` : ""}

${input.contactName ? "Personalize the email for this recipient." : ""}

Respond ONLY with valid JSON in this exact format:
{"subject": "<short personal subject>", "body": "<plain text email body>"}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock) {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return {
        subject: "Follow Up",
        body: `Dear ${input.contactName || "there"},\n\n${input.prompt}\n\nBest regards`,
      };
    }
  }
  return {
    subject: "Follow Up",
    body: `Dear ${input.contactName || "there"},\n\n${input.prompt}\n\nBest regards`,
  };
}
