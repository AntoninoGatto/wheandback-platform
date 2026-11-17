"use client";

import { useEffect } from "react";

export function ReferralCookie({ code }: { code?: string }) {
  useEffect(() => {
    if (!code) return;
    document.cookie = `wb_ref=${encodeURIComponent(code)}; path=/; max-age=2592000; samesite=lax`;
  }, [code]);
  return null;
}

export function InviteSimulator({
  tiers,
}: {
  tiers: { A: number; B: number; C: number };
}) {
  return (
    <form className="mt-8 rounded-2xl border border-gray-100 p-5" action="#" method="get">
      <h2 className="font-extrabold text-[#253866]">Simulatore</h2>
      <p className="mt-2 text-sm text-gray-600">
        Su 100 € netti di prodotto, il piano attivo riconosce questi premi in credito WheBack.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {(["A", "B", "C"] as const).map((tier) => (
          <li key={tier}>
            Fascia {tier}: {Math.round(tiers[tier] * 100)}% → € {(100 * tiers[tier]).toFixed(2)} in
            credito
          </li>
        ))}
      </ul>
    </form>
  );
}
