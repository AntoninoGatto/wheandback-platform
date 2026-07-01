import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import SellerSidebar from "@/components/seller/SellerSidebar";



export default async function SellerLayout({

  children,

  params,

}: {

  children: React.ReactNode;

  params: Promise<{ locale: string }>;

}) {

  const { locale } = await params;

  const supabase = await createClient();



  const { data: { user } } = await supabase.auth.getUser();



  if (!user) {

    redirect(`/${locale}/auth/login`);

  }



  const { createAdminClient } = await import("@/lib/supabase/server");

  const adminSupabase = await createAdminClient();

  const { data: profile } = await adminSupabase

    .from("profiles")

    .select("role, status")

    .eq("id", user.id)

    .single();



  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {

    redirect(`/${locale}/dashboard`);

  }



  let sellerActive = profile.role === "admin";



  if (profile.role === "seller") {

    const { data: sellerProfile } = await adminSupabase

      .from("seller_profiles")

      .select("is_active, approved_at, rejected_at")

      .eq("user_id", user.id)

      .maybeSingle();



    sellerActive = !!(sellerProfile?.is_active && sellerProfile.approved_at);



    if (!sellerActive && !sellerProfile?.rejected_at) {

      redirect(`/${locale}/partner/in-attesa`);

    }

  }



  return (

    <div className="min-h-screen flex" style={{ backgroundColor: "#f8fafc" }}>

      {sellerActive && <SellerSidebar locale={locale} />}

      <main className="flex-1 overflow-y-auto">

        {children}

      </main>

    </div>

  );

}

