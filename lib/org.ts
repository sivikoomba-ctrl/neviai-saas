import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("getOrgId: no user", authError?.message);
    throw new Error(authError?.message || "Unauthorized");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: { orgId: true },
  });

  if (!membership) {
    console.error("getOrgId: no membership for user", user.id);
    throw new Error("No organization");
  }
  return membership.orgId;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
