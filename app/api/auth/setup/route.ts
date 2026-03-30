import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orgName } = body;

    if (!orgName) {
      return Response.json({ error: "Organization name is required" }, { status: 400 });
    }

    // Create slug from name
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create org and membership in a transaction
    // Profile is handled by Supabase auth trigger (handle_new_user)
    const org = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now().toString(36)}`,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: "owner",
        },
      });

      return organization;
    });

    return Response.json(org, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/setup error:", error);
    return Response.json({ error: "Failed to set up organization" }, { status: 500 });
  }
}
