import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated - the (app) route group handles the dashboard
    // This page shouldn't normally be hit since (app)/page.tsx handles /
    redirect("/contacts");
  } else {
    redirect("/login");
  }
}
