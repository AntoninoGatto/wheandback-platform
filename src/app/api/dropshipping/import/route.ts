import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { importCjProduct } from "@/lib/dropshipping/import-product";

import type { CategoryId } from "@/constants/categories";

import { revalidatePath } from "next/cache";



export async function POST(req: NextRequest) {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });



  const { createAdminClient } = await import("@/lib/supabase/server");

  const adminSupabase = await createAdminClient();

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "Accesso negato" }, { status: 403 });



  const { cjProductId, categoryId } = await req.json();



  const result = await importCjProduct({

    cjProductId,

    categoryId: categoryId as CategoryId,

    sellerId: user.id,

    importedByUserId: user.id,

  });



  if (!result.success) {

    return NextResponse.json({ error: result.error }, { status: 400 });

  }



  revalidatePath("/it/shop");

  revalidatePath("/en/shop");



  return NextResponse.json({

    success: true,

    productId: result.productId,

    name: result.name,

    sellPrice: result.sellPrice,

    cashbackPercent: result.cashbackPercent,

  });

}

