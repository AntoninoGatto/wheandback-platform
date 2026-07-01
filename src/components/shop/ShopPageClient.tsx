"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";
import { ALLOWED_CATEGORIES } from "@/constants/categories";
import ProductCard from "./ProductCard";

import type { ShopCatalogProduct } from "@/types/shop";
import { compareCatalogRank } from "@/lib/shop/trending";

interface ShopPageClientProps {
  products: ShopCatalogProduct[];
}

type SortOption = "trending" | "cashback_desc" | "price_asc" | "price_desc";

export default function ShopPageClient({ products: initialProducts }: ShopPageClientProps) {
  const t = useTranslations("shop");
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [catalogNote, setCatalogNote] = useState<string | null>(null);

  const importError = searchParams.get("error");

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      const filtered = initialProducts
        .filter((p) => selectedCategory === "all" || p.category_id === selectedCategory)
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          if (sortBy === "trending") return compareCatalogRank(a, b);
          if (sortBy === "cashback_desc") return b.cashback_percent - a.cashback_percent;
          if (sortBy === "price_asc") return a.price - b.price;
          return b.price - a.price;
        });
      setProducts(filtered);
      setCatalogNote(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          category: selectedCategory,
          sortBy,
          locale,
        });
        const res = await fetch(`/api/shop/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.error) {
          setCatalogNote(data.error);
          setProducts(
            initialProducts
              .filter((p) => selectedCategory === "all" || p.category_id === selectedCategory)
          );
        } else {
          setProducts(data.products ?? []);
          if (data.translatedQuery) {
            setCatalogNote(
              `Ricerca tradotta per il catalogo internazionale: "${data.translatedQuery}".`
            );
          } else if (data.products?.some((p: ShopCatalogProduct) => p.source === "cj")) {
            setCatalogNote(
              "Catalogo CJ: solo stock magazzino UE, prezzo min. €3, popolarità verificata e margine 50%."
            );
          } else {
            setCatalogNote(null);
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setProducts(initialProducts);
        }
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, sortBy, initialProducts, locale]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ color: "#253866" }}>
          {t("title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {loading
            ? "Ricerca in corso..."
            : searchQuery.trim().length < 2
              ? `${products.length} prodotti in catalogo`
              : `${products.length} prodotti disponibili`}
        </p>
        {importError && (
          <p className="text-xs mt-2 font-medium" style={{ color: "#dc2626" }}>
            {importError}
          </p>
        )}
        {catalogNote && (
          <p className="text-xs mt-2 font-medium" style={{ color: "#00b295" }}>
            {catalogNote}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca prodotti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
            style={{ "--tw-ring-color": "#00b295" } as React.CSSProperties}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none cursor-pointer"
          style={{ color: "#253866" }}
        >
          <option value="trending">In evidenza</option>
          <option value="cashback_desc">Maggior premio referral</option>
          <option value="price_asc">Prezzo: Crescente</option>
          <option value="price_desc">Prezzo: Decrescente</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
          style={{ color: "#253866" }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("filters")}
        </button>
      </div>

      <div className="flex gap-8">
        <aside className={`w-56 flex-shrink-0 ${showFilters ? "block" : "hidden sm:block"}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#253866" }}>
              {t("categories")}
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all" ? "text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={selectedCategory === "all" ? { backgroundColor: "#253866" } : {}}
                >
                  Tutti i Prodotti
                </button>
              </li>
              {ALLOWED_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id ? "text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: "#253866" } : {}}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">Stiamo cercando nel catalogo Whe&Back e su CJ Dropshipping...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">{t("no_products")}</p>
              {searchQuery.trim().length >= 2 ? (
                <p className="text-sm mt-2">Prova con un&apos;altra parola chiave.</p>
              ) : (
                <p className="text-sm mt-2 max-w-md mx-auto">
                  Cerca per parola chiave (min. 2 lettere) per esplorare anche il catalogo CJ filtrato,
                  oppure importa prodotti dall&apos;area admin.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
