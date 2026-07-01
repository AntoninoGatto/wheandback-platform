import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReferralPageClient from "@/components/referral/ReferralPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const referralCode: string = user?.user_metadata?.referral_code ?? "";
  const referralUrl = referralCode
    ? `https://wheback.com/${locale}?ref=${referralCode}`
    : "";

  let invitedCount = 0;
  let earnedTotal = 0;

  if (user) {
    const { count } = await supabase
      .from("referral_rewards")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id);
    invitedCount = count ?? 0;

    const { data: rewards } = await supabase
      .from("referral_rewards")
      .select("amount")
      .eq("referrer_id", user.id)
      .eq("status", "credited");
    earnedTotal = rewards?.reduce((sum, r) => sum + r.amount, 0) ?? 0;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <ReferralPageClient
          referralCode={referralCode}
          referralUrl={referralUrl}
          invitedCount={invitedCount}
          earnedTotal={earnedTotal}
        />
      </main>
      <Footer />
    </div>
  );
}
