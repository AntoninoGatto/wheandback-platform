"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "wb_cookie_consent";

export function CookieBanner({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) == null);
  }, []);

  const save = (consent: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F1F0F1] bg-white p-4 shadow-lg">
      <div className="mx-auto max-w-6xl space-y-3">
        <p className="text-sm text-[#293241]">
          I cookie tecnici restano attivi. Analisi e marketing partono solo se li accetti.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-[#293241]">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked readOnly />
            Tecnici, sempre attivi
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            Analisi
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
            Marketing
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/legale/cookie`} className="px-3 py-2 text-sm font-semibold text-[#253866]">
            Dettaglio
          </Link>
          <button
            type="button"
            className="rounded-xl border border-[#253866] px-4 py-2 text-sm font-semibold text-[#253866]"
            onClick={() => save({ necessary: true, analytics: false, marketing: false })}
          >
            Solo tecnici
          </button>
          <button
            type="button"
            className="rounded-xl bg-[#00B295] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => save({ necessary: true, analytics, marketing })}
          >
            Salva scelta
          </button>
        </div>
      </div>
    </div>
  );
}
