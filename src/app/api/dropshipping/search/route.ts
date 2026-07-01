import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/dropshipping/cj";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { createAdminClient } = await import("@/lib/supabase/server");
  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accesso negato" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const productName = searchParams.get("q") ?? "";
  const pageNum = parseInt(searchParams.get("page") ?? "1");

  try {
    const result = await searchProducts({ productName, pageNum, pageSize: 20 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
