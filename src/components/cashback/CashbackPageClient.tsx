"use client";

import { useTranslations } from "next-intl";
import { Clock, ShieldCheck, CheckCircle, TrendingUp, Ban } from "lucide-react";

interface Transaction {
  id: string;
  created_at: string;
  product_name: string | null;
  amount: number;
  status: string;
}

interface CashbackPageClientProps {
  creditedBalance: number;
  pendingBalance: number;
  history: Transaction[];
}

export default function CashbackPageClient({
  creditedBalance,
  pendingBalance,
  history,
}: CashbackPageClientProps) {
  const t = useTranslations("cashback");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#253866" }}>
          {t("title")}
        </h1>
        <p className="text-gray-500">Gestisci e monitora il tuo saldo cashback</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #00b295 0%, #009980 100%)" }}
        >
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{t("balance")}</span>
          </div>
          <p className="text-4xl font-black">€{creditedBalance.toFixed(2)}</p>
          <p className="text-sm mt-2 opacity-70">Utilizzabile per nuovi acquisti</p>
        </div>

        <div
          className="rounded-2xl p-6 border-2"
          style={{ borderColor: "#253866", backgroundColor: "rgba(37,56,102,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-3" style={{ color: "#253866" }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold opacity-70">{t("pending")}</span>
          </div>
          <p className="text-4xl font-black" style={{ color: "#253866" }}>€{pendingBalance.toFixed(2)}</p>
          <p className="text-sm mt-2 text-gray-400">In attesa di consegna e recesso</p>
        </div>
      </div>

      {/* Important notice */}
      <div
        className="rounded-2xl p-6 mb-10 flex gap-4"
        style={{ backgroundColor: "rgba(0,178,149,0.08)", border: "1px solid rgba(0,178,149,0.3)" }}
      >
        <Ban className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00b295" }} />
        <div>
          <p className="font-bold text-sm mb-1" style={{ color: "#253866" }}>
            Il Cashback non è prelevabile in denaro
          </p>
          <p className="text-sm text-gray-600">{t("info_desc")}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
        <h2 className="text-xl font-black mb-6" style={{ color: "#253866" }}>
          {t("info_title")}
        </h2>
        <div className="space-y-4">
          {[
            {
              icon: CartIcon,
              title: "Effettua un acquisto",
              desc: "Il cashback viene calcolato automaticamente in base al margine del prodotto (5% – 35%)",
            },
            {
              icon: Clock,
              title: "Saldo sospeso",
              desc: "Il cashback appare come \"in attesa\" fino alla conferma della consegna",
            },
            {
              icon: ShieldCheck,
              title: "Accredito automatico",
              desc: "Dopo la consegna e i 14 giorni di diritto di recesso (o rinuncia anticipata), il saldo viene accreditato",
            },
            {
              icon: CheckCircle,
              title: "Usa il tuo credito",
              desc: "Il saldo accreditato è disponibile come sconto per i tuoi prossimi acquisti su Whe&Back®",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(37,56,102,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#253866" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#253866" }}>{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xl font-black mb-6" style={{ color: "#253866" }}>
          {t("history")}
        </h2>

        {history.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">Nessuna transazione ancora.</p>
            <p className="text-gray-400 text-xs mt-1">Il cashback apparirà qui dopo il tuo primo acquisto.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#253866" }}>
                    {item.product_name ?? "Acquisto"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ color: item.status === "credited" ? "#00b295" : "#f59e0b" }}>
                    +€{item.amount.toFixed(2)}
                  </p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={
                      item.status === "credited"
                        ? { backgroundColor: "rgba(0,178,149,0.12)", color: "#00b295" }
                        : { backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b" }
                    }
                  >
                    {item.status === "credited" ? "Accreditato" : "In Attesa"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
