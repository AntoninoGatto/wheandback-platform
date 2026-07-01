"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  TrendingUp, Clock, Gift, ShoppingBag, Copy, Check,
  ArrowRight, User as UserIcon, Package,
} from "lucide-react";
import { useState } from "react";

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [copied, setCopied] = useState(false);

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "Utente";
  const referralCode = user.user_metadata?.referral_code || "WHEBACK000";
  const referralUrl = `https://wheback.com/${locale}?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>
          Ciao, {firstName}! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #00b295 0%, #009980 100%)" }}
        >
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Cashback Disponibile</span>
          </div>
          <p className="text-2xl font-black">€0,00</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3" style={{ color: "#f59e0b" }}>
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold text-gray-500">In Attesa</span>
          </div>
          <p className="text-2xl font-black" style={{ color: "#253866" }}>€0,00</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3" style={{ color: "#253866" }}>
            <Gift className="w-4 h-4" />
            <span className="text-xs font-semibold text-gray-500">Premi Referral</span>
          </div>
          <p className="text-2xl font-black" style={{ color: "#253866" }}>€0,00</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3" style={{ color: "#253866" }}>
            <Package className="w-4 h-4" />
            <span className="text-xs font-semibold text-gray-500">Ordini</span>
          </div>
          <p className="text-2xl font-black" style={{ color: "#253866" }}>0</p>
        </div>
      </div>

      {/* Referral link */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
      >
        <p className="text-white/70 text-sm font-semibold mb-3">Il Tuo Link Referral Personale</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono truncate">
            {referralUrl}
          </div>
          <button
            onClick={handleCopyReferral}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0"
            style={{ backgroundColor: copied ? "#009980" : "#00b295", color: "white" }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: `/${locale}/shop`, icon: ShoppingBag, label: "Vai allo Shop", color: "#00b295" },
          { href: `/${locale}/cashback`, icon: TrendingUp, label: "Il Mio Cashback", color: "#253866" },
          { href: `/${locale}/referral`, icon: Gift, label: "Programma Referral", color: "#7c3aed" },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "#253866" }}>{label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-black mb-4" style={{ color: "#253866" }}>
          Il Mio Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="font-semibold" style={{ color: "#253866" }}>{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Nome</p>
            <p className="font-semibold" style={{ color: "#253866" }}>
              {user.user_metadata?.full_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Codice Referral</p>
            <p className="font-black" style={{ color: "#00b295" }}>{referralCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Account creato il</p>
            <p className="font-semibold" style={{ color: "#253866" }}>
              {new Date(user.created_at).toLocaleDateString("it-IT")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
