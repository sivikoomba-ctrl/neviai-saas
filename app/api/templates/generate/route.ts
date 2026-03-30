import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/org";
import { generateTemplate } from "@/lib/ai/generate-template";
import { incrementUsage } from "@/lib/quota";

export async function POST(request: Request) {
  try {
    let orgId: string;
    try { orgId = await getOrgId(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

    const body = await request.json();
    const { description, category } = body;

    if (!description) return Response.json({ error: "description is required" }, { status: 400 });

    let name: string;
    let subject: string;
    let templateBody: string;
    let variables: string[];

    try {
      const result = await generateTemplate({ category: category || "general", description });
      name = result.name;
      subject = result.subject;
      templateBody = result.body;
      variables = result.variables;
      await incrementUsage(orgId, "ai");
    } catch {
      name = `${category || "Custom"} Template`;
      subject = `{{name}} - ${description.slice(0, 40)}`;
      templateBody = `Dear {{name}},\n\n${description}\n\nBest regards,\nThe {{company}} Team`;
      variables = ["{{name}}", "{{company}}"];
    }

    const template = await prisma.template.create({
      data: { orgId, name, subject, body: templateBody, category: category || "general", variables, isAiGenerated: true },
    });

    return Response.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to generate template:", error);
    return Response.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
