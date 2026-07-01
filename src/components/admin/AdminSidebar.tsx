"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Store, TrendingUp, Heart, FileText, LogOut, Megaphone, Download, ClipboardList, Mail } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: "Panoramica" },
    { href: `/${locale}/admin/prodotti`, icon: Package, label: "Prodotti" },
    { href: `/${locale}/admin/venditori`, icon: Store, label: "Partner" },
    { href: `/${locale}/admin/venditori/inviti`, icon: Mail, label: "Inviti Partner" },
    { href: `/${locale}/admin/utenti`, icon: Users, label: "Utenti" },
    { href: `/${locale}/admin/cashback`, icon: TrendingUp, label: "Cashback" },
    { href: `/${locale}/admin/beneficenza`, icon: Heart, label: "Beneficenza" },
    { href: `/${locale}/admin/royalty`, icon: FileText, label: "Royalty" },
    { href: `/${locale}/admin/piano-marketing`, icon: Megaphone, label: "Piano Marketing" },
    { href: `/${locale}/admin/importa`, icon: Download, label: "Importa Prodotti" },
    { href: `/${locale}/admin/importa/log`, icon: ClipboardList, label: "Log Importazioni" },
  ];

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href={`/${locale}`} className="flex items-center gap-0.5">
          <Image src="/logo.png" alt="Whe&Back®" width={110} height={32} className="h-7 w-auto" />
          <sup className="text-xs -ml-1 -mt-2" style={{ color: "#253866" }}>®</sup>
        </Link>
        <p className="text-xs text-gray-400 mt-1">Pannello Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={isActive ? { backgroundColor: "#253866", color: "white" } : { color: "#64748b" }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <form action={logout.bind(null, locale)}>
          <button type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </form>
      </div>
    </aside>
  );
}
