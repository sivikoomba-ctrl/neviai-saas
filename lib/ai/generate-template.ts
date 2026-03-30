import claude from "@/lib/claude";

interface TemplateInput {
  category: string;
  description: string;
}

interface TemplateResult {
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export async function generateTemplate(
  input: TemplateInput
): Promise<TemplateResult> {
  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are an email template designer. Create a reusable email template.

Category: ${input.category}
Description: "${input.description}"

Use template variables like {{name}}, {{company}}, {{dealTitle}}, {{amount}} where appropriate for personalization.

Respond ONLY with valid JSON:
{"name": "<template name>", "subject": "<subject with optional {{variables}}>", "body": "<full email body with {{variables}} for personalization>", "variables": ["name", "company", ...list of variables used]}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock) {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return {
        name: `${input.category} Template`,
        subject: `{{name}} - ${input.description}`,
        body: `Dear {{name}},\n\n${input.description}\n\nBest regards`,
        variables: ["name"],
      };
    }
  }
  return {
    name: `${input.category} Template`,
    subject: `{{name}} - ${input.description}`,
    body: `Dear {{name}},\n\n${input.description}\n\nBest regards`,
    variables: ["name"],
  };
}
