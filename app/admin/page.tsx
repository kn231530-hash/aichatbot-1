import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  let count = 0;
  let dbError = "";

  try {
    const admin = createAdminClient();
    const result = await admin.from("chat_messages").select("*", { count: "exact", head: true });
    count = result.count ?? 0;
    if (result.error) dbError = result.error.message;
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Admin database configuration is missing.";
  }

  return (
    <main className="adminShell">
      <section className="adminCard">
        <div className="adminTop">
          <div><h1>Orken AI — Admin</h1><p>{user.email}</p></div>
          <form action="/api/admin/logout" method="post"><button>Log out</button></form>
        </div>
        <div className="stat"><strong>{count}</strong><span>Total saved messages</span></div>
        {dbError && <div className="error" style={{marginTop: 16}}>{dbError}</div>}
      </section>
    </main>
  );
}