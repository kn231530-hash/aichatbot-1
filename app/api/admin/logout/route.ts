import { NextResponse } from "next/server";
import { createAdminServerClient } from "../../../../app/admin/supabase-server";

export async function POST(request: Request) {
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}