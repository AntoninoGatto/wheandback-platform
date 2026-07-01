import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PartnerInviteClient from "@/components/partner/PartnerInviteClient";
import { getSellerInvitationByToken } from "@/lib/seller/invitation-actions";
import { createClient } from "@/lib/supabase/server";

export default async function PartnerInvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const invitation = await getSellerInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  const expired = new Date(invitation.expires_at).getTime() < Date.now();
  if (expired && !invitation.accepted_at) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-black mb-2" style={{ color: "#253866" }}>
              Invito scaduto
            </h1>
            <p className="text-gray-500 text-sm">
              Contatta Whe&Back® per ricevere un nuovo link di onboarding partner.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 bg-gray-50">
        <PartnerInviteClient
          invitation={invitation}
          isLoggedIn={!!user}
          userEmail={user?.email}
        />
      </main>
      <Footer />
    </div>
  );
}
