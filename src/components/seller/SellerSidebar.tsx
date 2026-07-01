"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, BarChart2, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";

interface SellerSidebarProps {
  locale: string;
}

export default function SellerSidebar({ locale }: SellerSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/seller`, icon: LayoutDashboard, label: "Panoramica" },
    { href: `/${locale}/seller/prodotti`, icon: Package, label: "I Miei Prodotti" },
    { href: `/${locale}/seller/prodotti/nuovo`, icon: PlusCircle, label: "Aggiungi Prodotto" },
    { href: `/${locale}/seller/statistiche`, icon: BarChart2, label: "Statistiche" },
  ];

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href={`/${locale}`} className="flex items-center gap-0.5">
          <Image src="/logo.png" alt="Whe&Back®" width={110} height={32} className="h-7 w-auto" />
          <sup className="text-xs -ml-1 -mt-2" style={{ color: "#253866" }}>®</sup>
        </Link>
        <p className="text-xs text-gray-400 mt-1">Area Venditore</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={
                isActive
                  ? { backgroundColor: "#253866", color: "white" }
                  : { color: "#64748b" }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <form action={logout.bind(null, locale)}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </form>
      </div>
    </aside>
  );
}
