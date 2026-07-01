"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPartnerProduct } from "@/lib/seller/partner-product-actions";
import { ALLOWED_CATEGORIES } from "@/constants/categories";
import { CASHBACK } from "@/constants/cashback";
import { AlertTriangle, CheckCircle, Save } from "lucide-react";

export default function NewProductPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    purchase_price: "",
    stock: "",
    cashback_percent: "10",
    category_id: "largo-consumo",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cashback = parseFloat(form.cashback_percent);
    const price = parseFloat(form.price);
    const purchasePrice = parseFloat(form.purchase_price);

    if (cashback < CASHBACK.MIN_PERCENT || cashback > CASHBACK.MAX_PERCENT) {
      setError(`Il cashback deve essere tra ${CASHBACK.MIN_PERCENT}% e ${CASHBACK.MAX_PERCENT}%.`);
      return;
    }

    // Regola Antonino: prezzo di acquisto ≤ 50% del prezzo di vendita
    if (purchasePrice > price * (CASHBACK.MIN_MARGIN_PERCENT / 100)) {
      setError(
        `Il prezzo di acquisto (€${purchasePrice.toFixed(2)}) non può superare il 50% del prezzo di vendita (€${(price * 0.5).toFixed(2)}). ` +
        `Margine minimo richiesto: 50% per coprire cashback (35%) + beneficenza (1%) + margine aziendale.`
      );
      return;
    }

    // Verifica che il cashback non superi il 35%
    if (cashback > CASHBACK.REFERRAL_SHARE_PERCENT) {
      setError(`Il cashback massimo consentito è ${CASHBACK.REFERRAL_SHARE_PERCENT}% (regola piano marketing).`);
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.set(k, v));

      const result = await createPartnerProduct(fd);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/seller/prodotti`), 2000);
    });
  };

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "#253866" }}>Prodotto Inviato!</h2>
          <p className="text-gray-500 text-sm">Il prodotto è in attesa di approvazione da parte del team Whe&Back®.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Nuovo Prodotto</h1>
        <p className="text-gray-400 text-sm mt-1">
          Il prodotto sarà visibile nello shop dopo l&apos;approvazione del team Whe&Back®.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl mb-6 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Nome Prodotto *</label>
          <input name="name" required value={form.name} onChange={handleChange}
            placeholder="Es. Tazza Termica Premium"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Descrizione *</label>
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
            placeholder="Descrivi il prodotto in modo chiaro e completo..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Categoria *</label>
          <select name="category_id" value={form.category_id} onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] bg-white">
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Prezzo di Vendita (€) *</label>
            <input name="price" type="number" required min="0.01" step="0.01" value={form.price} onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
              Prezzo di Acquisto (€) *
              <span className="text-gray-400 font-normal"> — max 50% del prezzo vendita</span>
            </label>
            <input name="purchase_price" type="number" required min="0.01" step="0.01" value={form.purchase_price} onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
        </div>

        {/* Margin preview */}
        {form.price && form.purchase_price && (
          <div className="rounded-xl p-3 text-xs"
            style={{
              backgroundColor: parseFloat(form.purchase_price) <= parseFloat(form.price) * 0.5
                ? "rgba(0,178,149,0.06)" : "rgba(239,68,68,0.06)",
              border: `1px solid ${parseFloat(form.purchase_price) <= parseFloat(form.price) * 0.5
                ? "rgba(0,178,149,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
            <div className="flex justify-between font-semibold" style={{ color: "#253866" }}>
              <span>Margine: {(((parseFloat(form.price) - parseFloat(form.purchase_price)) / parseFloat(form.price)) * 100).toFixed(1)}%</span>
              <span style={{ color: parseFloat(form.purchase_price) <= parseFloat(form.price) * 0.5 ? "#00b295" : "#dc2626" }}>
                {parseFloat(form.purchase_price) <= parseFloat(form.price) * 0.5 ? "✓ Sufficiente" : "✗ Insufficiente (min 50%)"}
              </span>
            </div>
            <div className="flex gap-4 mt-1.5 text-gray-500">
              <span>Cashback cliente: €{(parseFloat(form.price) * parseFloat(form.cashback_percent) / 100).toFixed(2)}</span>
              <span>Beneficenza (1%): €{(parseFloat(form.price) * 0.01).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Quantità in Stock *</label>
            <input name="stock" type="number" required min="0" value={form.stock} onChange={handleChange}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
              Cashback % ({CASHBACK.MIN_PERCENT}–{CASHBACK.MAX_PERCENT}) *
            </label>
            <input name="cashback_percent" type="number" required
              min={CASHBACK.MIN_PERCENT} max={CASHBACK.MAX_PERCENT} step="0.5"
              value={form.cashback_percent} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
        </div>

        {/* Rules warning */}
        <div className="rounded-xl p-4 text-xs text-gray-500 leading-relaxed space-y-1"
          style={{ backgroundColor: "rgba(37,56,102,0.04)", border: "1px solid rgba(37,56,102,0.1)" }}>
          <p><strong style={{ color: "#253866" }}>Regole obbligatorie (Piano Marketing Whe&Back®):</strong></p>
          <p>• Il prezzo di acquisto deve essere ≤ 50% del prezzo di vendita</p>
          <p>• Il prezzo di vendita non deve superare il prezzo Amazon per lo stesso prodotto</p>
          <p>• Il cashback massimo consentito è 35% (piano marketing attivo)</p>
          <p>• Sono esclusi: abbigliamento, scarpe, borse, accessori donna (Fase 1)</p>
          <p>• Il sistema blocca automaticamente i prodotti con termini non consentiti dal codice etico</p>
        </div>

        <button type="submit" disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
          style={{ backgroundColor: "#00b295" }}>
          {isPending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />}
          {isPending ? "Invio in corso..." : "Invia per Approvazione"}
        </button>
      </form>
    </div>
  );
}
