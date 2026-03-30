import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: { orgId: true },
  });

  if (!membership) throw new Error("No organization");
  return membership.orgId;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
