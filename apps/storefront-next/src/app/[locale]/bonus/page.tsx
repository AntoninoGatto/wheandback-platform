import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";
import { couponPieceCopy, formatEuro, formatPercentBps } from "@/lib/offers-format";
import { AddVariantButton } from "@/components/AddVariantButton";
import { CopyCode } from "@/components/CopyCode";

interface BonusPageProps {
  params: Promise<{ locale: string }>;
}

type PublicCode = {
  code: string;
  variant_id: string;
  sku: string;
  discount_bps: number;
  public_price_cents: number;
  price_cents: number;
  discount_cents: number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  max_uses: number | null;
  min_previous_price_cents: number | null;
};

async function loadCodes(): Promise<PublicCode[]> {
  if (!MEDUSA_PUBLISHABLE_KEY) return [];
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/campaigns`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      next: { revalidate: 60, tags: ["campaigns"] },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { codes?: PublicCode[] };
    return body.codes || [];
  } catch {
    return [];
  }
}

function when(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short", timeZone }).format(new Date(iso));
}

export default async function BonusPage({ params }: BonusPageProps) {
  const { locale } = await params;
  const codes = await loadCodes();

  return (
    <main className="flex min-h-screen flex-col bg-[#F1F0F1]">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[#253866]">Codici sconto</h1>
        <p className="mt-3 max-w-2xl text-[#293241]">
          Un codice per riga, tra il 3% e il 13%. Se due codici coprono la stessa riga, in checkout ti chiediamo quale usare.
        </p>
        {codes.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-white p-8 text-[#293241]">Nessun codice attivo in questo momento.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
            <table className="w-full min-w-[720px] text-left text-sm text-[#293241]">
              <thead className="bg-[#253866] text-white">
                <tr>
                  <th className="px-3 py-3">Codice</th>
                  <th className="px-3 py-3">Varianti</th>
                  <th className="px-3 py-3">Sconto</th>
                  <th className="px-3 py-3">Prezzo</th>
                  <th className="px-3 py-3">Periodo</th>
                  <th className="px-3 py-3">Limite</th>
                  <th className="px-3 py-3">Minimo 30 giorni</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={`${code.code}-${code.variant_id}`} className="border-t border-[#F1F0F1]">
                    <td className="px-3 py-3">
                      <CopyCode code={code.code} />
                    </td>
                    <td className="px-3 py-3">{code.sku}</td>
                    <td className="px-3 py-3">{formatPercentBps(code.discount_bps)}%</td>
                    <td className="px-3 py-3">
                      {couponPieceCopy(code.discount_cents, code.discount_bps, code.price_cents)}
                      <span className="mt-1 block text-xs">Listino {formatEuro(code.public_price_cents)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {when(code.starts_at, code.timezone)} – {when(code.ends_at, code.timezone)} ({code.timezone})
                    </td>
                    <td className="px-3 py-3">{code.max_uses == null ? "Nessun tetto" : `${code.max_uses} usi`}</td>
                    <td className="px-3 py-3">
                      {code.min_previous_price_cents == null ? "Non disponibile" : formatEuro(code.min_previous_price_cents)}
                    </td>
                    <td className="px-3 py-3">
                      <AddVariantButton variantId={code.variant_id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link href={`/${locale}/shop`} className="mt-6 inline-flex text-sm font-semibold text-[#253866]">
          Vai allo shop
        </Link>
      </div>
    </main>
  );
}
