import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex bg-[#0f172a]">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
