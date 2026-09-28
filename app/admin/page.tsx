import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { count } = await supabase.from("chat_messages").select("*", { count: "exact", head: true });

  return (
    <main className="adminShell">
      <section className="adminCard">
        <div className="adminTop"><div><h1>AI Chatbot 1 — Admin</h1><p>{user.email}</p></div><form action="/api/admin/logout" method="post"><button>Log out</button></form></div>
        <div className="stat"><strong>{count ?? 0}</strong><span>Total saved messages</span></div>
      </section>
    </main>
  );
}