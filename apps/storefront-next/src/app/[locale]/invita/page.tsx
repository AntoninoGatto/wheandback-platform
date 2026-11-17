import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { InviteSimulator, ReferralCookie } from "@/components/InviteSimulator";
import { getLoyaltyPlan } from "@/lib/loyalty";

interface InvitePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { locale } = await params;
  const { ref } = await searchParams;
  const plan = await getLoyaltyPlan();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold text-[#00b295]">{plan.headline}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#253866]">Invita un amico</h1>
        <p className="mt-4 text-gray-700">
          Un livello. Il premio parte sull&apos;ordine pagato della persona invitata, di default
          solo il primo, e segue lo stesso periodo di attesa del cashback. L&apos;auto-invito è
          bloccato. Il credito non si converte in denaro.
        </p>
        <ReferralCookie code={ref} />
        {ref ? (
          <p className="mt-4 rounded-xl bg-[#e7f8f5] p-3 text-sm">
            Codice in arrivo: <strong>{ref}</strong>. Resta nel cookie di attribuzione per 30 giorni
            e viene letto in registrazione.
          </p>
        ) : null}
        <InviteSimulator tiers={plan.referral_tiers || { A: 0.35, B: 0.27, C: 0.21 }} />
        <Link href={`/${locale}/auth/register`} className="mt-6 inline-flex text-sm font-semibold text-[#253866]">
          Crea un account
        </Link>
      </div>
    </main>
  );
}
