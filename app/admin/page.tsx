import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server"; // relative import avoids deployment alias issues

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  const { count, error } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true });

  return (
    <main className="adminShell">
      <section className="adminCard">
        <div className="adminTop">
          <div><h1>Orken AI — Admin</h1><p>{user.email}</p></div>
          <form action="/api/admin/logout" method="post"><button>Log out</button></form>
        </div>
        <div className="stat"><strong>{count ?? 0}</strong><span>Total saved messages</span></div>
        {error && <div className="error" style={{marginTop: 16}}>{error.message}</div>}
      </section>
    </main>
  );
}