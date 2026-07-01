"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Gift, Users, TrendingUp, ChevronRight } from "lucide-react";

const LEVELS = [
  { level: 1, label: "Amici Diretti", reward: "5% del loro primo acquisto", color: "#00b295" },
  { level: 2, label: "Amici degli Amici", reward: "2% dei loro acquisti", color: "#253866" },
  { level: 3, label: "Rete Estesa", reward: "1% degli acquisti", color: "#7c3aed" },
];

interface ReferralPageClientProps {
  referralCode: string;
  referralUrl: string;
  invitedCount: number;
  earnedTotal: number;
}

export default function ReferralPageClient({
  referralCode,
  referralUrl,
  invitedCount,
  earnedTotal,
}: ReferralPageClientProps) {
  const t = useTranslations("referral");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(0,178,149,0.12)" }}
        >
          <Gift className="w-8 h-8" style={{ color: "#00b295" }} />
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ color: "#253866" }}>
          {t("title")}
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">{t("desc")}</p>
      </div>

      {/* Referral link box */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
      >
        <p className="text-white/70 text-sm font-semibold mb-3">{t("your_link")}</p>

        {referralCode ? (
          <>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono truncate">
                {referralUrl}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0"
                style={{ backgroundColor: copied ? "#009980" : "#00b295", color: "white" }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t("copied") : t("copy_link")}
              </button>
            </div>
            <p className="text-white/50 text-xs mt-3">
              Il tuo codice personale: <span className="font-bold text-white/80">{referralCode}</span>
            </p>
          </>
        ) : (
          <p className="text-white/50 text-sm">
            Accedi al tuo account per vedere il tuo link referral personale.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: Users, label: t("invited"), value: invitedCount.toString(), color: "#253866" },
          { icon: TrendingUp, label: t("earned"), value: `€${earnedTotal.toFixed(2)}`, color: "#00b295" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: "#253866" }}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Multi-level explanation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-black mb-6" style={{ color: "#253866" }}>
          Sistema Premi Multilivello
        </h2>
        <div className="space-y-3">
          {LEVELS.map(({ level, label, reward, color }) => (
            <div key={level} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${color}08` }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {level}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#253866" }}>{label}</p>
                <p className="text-xs text-gray-500">{reward}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          I livelli e le percentuali esatte possono variare in base al piano marketing attivo.
        </p>
      </div>

      {/* CTA: share */}
      {referralUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent("Acquista su Whe%26Back® con il mio link e ottieni cashback! " + referralUrl)}` },
            { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent("Acquista su Whe&Back® con il mio link!")}` },
            { label: "Email", href: `mailto:?subject=${encodeURIComponent("Ti invito su Whe&Back®")}&body=${encodeURIComponent("Ciao! Acquista su Whe&Back® con il mio link referral e ottieni cashback: " + referralUrl)}` },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 rounded-xl border-2 text-sm font-bold transition-all hover:text-white hover:border-[#253866] hover:bg-[#253866]"
              style={{ borderColor: "#253866", color: "#253866" }}
            >
              Condividi via {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
