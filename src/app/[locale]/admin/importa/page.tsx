"use client";

import { useState } from "react";
import { Search, Download, CheckCircle, AlertTriangle, Loader2, Package, RefreshCw } from "lucide-react";
import { ALLOWED_CATEGORIES } from "@/constants/categories";

interface CJProduct {
  pid: string;
  productNameEn: string;
  productName: string;
  productImage: string;
  sellPrice: number;
  categoryName: string;
}

interface ImportResult {
  success?: boolean;
  name?: string;
  sellPrice?: number;
  cashbackPercent?: number;
  error?: string;
}

export default function AdminImportaPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALLOWED_CATEGORIES[0].id);
  const [products, setProducts] = useState<CJProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ImportResult>>({});
  const [searched, setSearched] = useState(false);

  const [searchError, setSearchError] = useState("");
  const [syncingMedia, setSyncingMedia] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSyncMedia = async () => {
    setSyncingMedia(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/dropshipping/backfill-media", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setSyncMessage(data.error);
      } else {
        setSyncMessage(`Immagini, descrizioni e recensioni aggiornate per ${data.updated}/${data.total} prodotti.`);
      }
    } catch (e) {
      setSyncMessage(`Errore: ${String(e)}`);
    } finally {
      setSyncingMedia(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/dropshipping/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) {
        setSearchError(data.error);
        setProducts([]);
      } else {
        setProducts(data.products ?? []);
      }
    } catch (e) {
      setSearchError(`Errore di rete: ${String(e)}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (pid: string) => {
    setImporting(pid);
    try {
      const res = await fetch("/api/dropshipping/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cjProductId: pid, categoryId: selectedCategory }),
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [pid]: data }));
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Centro Importazione Prodotti</h1>
        <p className="text-gray-400 text-sm mt-1">
          Cerca nel catalogo CJ Dropshipping — le descrizioni vengono generate in italiano con AI e il prezzo rispetta la regola del 50% di margine
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncMedia}
            disabled={syncingMedia}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#253866" }}
          >
            {syncingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizza immagini, descrizioni e recensioni CJ
          </button>
          {syncMessage && (
            <p className="text-xs font-medium" style={{ color: syncMessage.startsWith("Errore") ? "#dc2626" : "#00b295" }}>
              {syncMessage}
            </p>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Cerca prodotti (es. tazza termica, lampada LED...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#00b295]"
            style={{ color: "#253866" }}
          >
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#253866" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Cerca
          </button>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["✓ Margine min 50% al checkout", "✓ Blacklist controllata", "✓ Descrizioni in italiano con AI", "✓ Pubblicazione automatica"].map((badge) => (
            <span key={badge} className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: "rgba(0,178,149,0.08)", color: "#00b295" }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">Ricerca nel catalogo CJ Dropshipping...</p>
        </div>
      )}

      {!loading && searchError && (
        <div className="flex items-start gap-3 p-5 rounded-2xl mb-4"
          style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: "#dc2626" }}>Errore connessione CJ Dropshipping</p>
            <p className="text-xs text-gray-500">{searchError}</p>
          </div>
        </div>
      )}

      {!loading && searched && products.length === 0 && !searchError && (
        <div className="text-center py-20">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm">Nessun prodotto trovato. Prova con un termine diverso.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const result = results[product.pid];
            const isImporting = importing === product.pid;
            const alreadyImported = result?.success;
            const hasError = result?.error;

            // Calculate estimated sell price
            const estimatedSell = product.sellPrice > 0
              ? Math.ceil(product.sellPrice / 0.5) - 0.01
              : null;

            return (
              <div key={product.pid} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                {/* Image */}
                <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {product.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.productImage} alt={product.productNameEn}
                      className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-200" />
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: "#253866" }}>
                    {product.productNameEn || product.productName}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{product.categoryName}</p>

                  <div className="flex justify-between text-xs mb-3">
                    <div>
                      <p className="text-gray-400">Prezzo fornitore</p>
                      <p className="font-bold" style={{ color: "#253866" }}>€{product.sellPrice?.toFixed(2)}</p>
                    </div>
                    {estimatedSell && (
                      <div className="text-right">
                        <p className="text-gray-400">Prezzo vendita stimato</p>
                        <p className="font-bold" style={{ color: "#00b295" }}>€{estimatedSell.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {/* Status / button */}
                  {alreadyImported ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl justify-center"
                      style={{ backgroundColor: "rgba(0,178,149,0.08)", color: "#00b295" }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Importato — €{result.sellPrice?.toFixed(2)} · CB {result.cashbackPercent}%
                    </div>
                  ) : hasError ? (
                    <div className="flex items-start gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "rgba(239,68,68,0.06)", color: "#dc2626" }}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{result.error}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleImport(product.pid)}
                      disabled={isImporting}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-60 mt-auto"
                      style={{ backgroundColor: "#00b295" }}
                    >
                      {isImporting
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importando con AI...</>
                        : <><Download className="w-3.5 h-3.5" /> Importa</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
