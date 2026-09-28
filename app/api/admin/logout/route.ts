import { NextResponse } from "next/server";
import { createAdminServerClient } from "../../../../app/admin/supabase-server";

// VERCEL_FIX_20260928: no @/lib/supabase/server import
export async function POST(request: Request) {
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}