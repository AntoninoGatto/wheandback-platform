"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem("wb_cookie_ok") !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-700">
          Usiamo cookie tecnici per il carrello e, se arrivi da un invito, un cookie di attribuzione.
          Il testo completo è una bozza da validare.
        </p>
        <div className="flex gap-2">
          <Link href={`/${locale}/legale/cookie`} className="text-sm font-semibold text-[#253866]">
            Leggi
          </Link>
          <button
            type="button"
            className="rounded-xl bg-[#253866] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              window.localStorage.setItem("wb_cookie_ok", "1");
              setVisible(false);
            }}
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}
