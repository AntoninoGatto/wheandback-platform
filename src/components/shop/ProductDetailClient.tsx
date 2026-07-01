"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Tag,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  Star,
  Package,
  Gift,
} from "lucide-react";
import { ALLOWED_CATEGORIES } from "@/constants/categories";
import { CASHBACK } from "@/constants/cashback";
import { isHtmlDescription, sanitizeProductHtml } from "@/lib/dropshipping/cj";
import ProductCard from "./ProductCard";

export interface ProductReview {
  commentId: string;
  comment: string;
  commentDate: string;
  commentUser: string;
  score: number;
  commentUrls: string[];
  countryCode?: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cashback_percent: number;
  stock: number;
  images: string[];
  slug: string;
  category_id: string;
  reviews?: ProductReview[] | null;
  listed_num?: number | null;
  weight_grams?: number | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  cashback_percent: number;
  category_id: string;
  images: string[];
  slug: string;
}

interface ProductDetailClientProps {
  product: Product;
  locale: string;
  isLoggedIn: boolean;
  relatedProducts: RelatedProduct[];
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{ color: i < score ? "#f59e0b" : "#e5e7eb" }}
          fill={i < score ? "#f59e0b" : "none"}
        />
      ))}
    </div>
  );
}

export default function ProductDetailClient({
  product,
  locale,
  isLoggedIn,
  relatedProducts,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const reviews = (product.reviews ?? []) as ProductReview[];
  const avgScore = reviews.length
    ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
    : 0;
  const categoryLabel =
    ALLOWED_CATEGORIES.find((c) => c.id === product.category_id)?.label ??
    product.category_id.replace(/-/g, " ");

  const handleBuy = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity, locale }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Errore nel checkout");
      setLoading(false);
    }
  };

  const cashbackAmount = ((product.price * product.cashback_percent) / 100) * quantity;
  const totalPrice = product.price * quantity;
  const referralRewardAmount = cashbackAmount;
  const referralPercent = Math.min(product.cashback_percent, CASHBACK.REFERRAL_SHARE_PERCENT);
  const images = product.images?.length ? product.images : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href={`/${locale}/shop`}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity"
        style={{ color: "#253866" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Torna allo Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div
            className="rounded-2xl overflow-hidden flex items-center justify-center aspect-square mb-3"
            style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f8f5 100%)" }}
          >
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Tag className="w-24 h-24 opacity-10" style={{ color: "#253866" }} />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-[#00b295]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full self-start mb-4"
            style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}
          >
            {categoryLabel}
          </span>

          <h1 className="text-3xl font-black mb-3 leading-tight" style={{ color: "#253866" }}>
            {product.name}
          </h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating score={Math.round(avgScore)} />
              <span className="text-sm font-semibold text-gray-500">
                {avgScore.toFixed(1)} · {reviews.length} recensioni
              </span>
            </div>
          )}

          {(product.weight_grams || product.listed_num) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.weight_grams ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                  Peso: {(product.weight_grams / 1000).toFixed(2)} kg
                </span>
              ) : null}
              {product.listed_num ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                  Popolare su CJ · {product.listed_num}+ vendite
                </span>
              ) : null}
            </div>
          )}

          <div
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: "rgba(37,56,102,0.04)", border: "1px solid rgba(37,56,102,0.1)" }}
          >
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Prezzo di acquisto</p>
              <p className="text-3xl font-black" style={{ color: "#253866" }}>
                €{totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Paghi il <strong>100% del prezzo pubblicato</strong>. Nessuno sconto viene applicato al checkout.
              </p>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "rgba(0,178,149,0.06)", border: "1px solid rgba(0,178,149,0.15)" }}
            >
              <div className="flex items-start gap-2 mb-2">
                <Gift className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00b295" }} />
                <p className="text-sm font-bold" style={{ color: "#253866" }}>
                  Premio referral per chi invita
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Il cashback <strong>non va a chi acquista</strong>, ma a chi ha condiviso il link referral.
                Se inviti un <strong>nuovo cliente</strong> e lui compra questo prodotto, ricevi un credito fino a{" "}
                <strong style={{ color: "#00b295" }}>
                  €{referralRewardAmount.toFixed(2)} ({referralPercent}% del suo acquisto)
                </strong>.
              </p>
              <p className="text-xs text-gray-500">
                Massimo possibile sul marketplace: {CASHBACK.REFERRAL_SHARE_PERCENT}% dell&apos;importo speso dal cliente invitato.
              </p>
              {isLoggedIn && (
                <Link
                  href={`/${locale}/referral`}
                  className="inline-flex items-center gap-1 text-xs font-bold mt-3 hover:opacity-80"
                  style={{ color: "#00b295" }}
                >
                  Ottieni il tuo link referral →
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-semibold" style={{ color: "#253866" }}>Quantità</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                style={{ color: "#253866" }}
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-bold" style={{ color: "#253866" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                style={{ color: "#253866" }}
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400">{product.stock} disponibili</p>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#00b295" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {loading ? "Reindirizzamento..." : `Acquista — €${totalPrice.toFixed(2)}`}
            </button>
          ) : (
            <div className="space-y-3">
              <Link
                href={`/${locale}/auth/login`}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-base transition-all hover:opacity-90"
                style={{ backgroundColor: "#00b295" }}
              >
                Accedi per Acquistare
              </Link>
              <p className="text-xs text-center text-gray-400">
                Non hai un account?{" "}
                <Link href={`/${locale}/auth/register`} className="font-semibold" style={{ color: "#00b295" }}>
                  Registrati gratis
                </Link>
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Shield, label: "Pagamento Sicuro" },
              { icon: Gift, label: "Referral fino al 35%" },
              { icon: Clock, label: "Credito dopo consegna" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#00b295" }} />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-6 rounded-xl p-4 flex items-start gap-3"
            style={{ backgroundColor: "rgba(0,178,149,0.06)", border: "1px solid rgba(0,178,149,0.2)" }}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00b295" }} />
            <p className="text-xs text-gray-500 leading-relaxed">
              Il credito referral viene inviato a chi ha invitato il cliente, non a chi effettua l&apos;acquisto.
              Viene accreditato dopo la consegna e i {CASHBACK.WITHDRAWAL_DAYS} giorni di recesso.
              Non è prelevabile in contanti: resta credito interno utilizzabile solo per nuovi acquisti su Whe&Back®.
            </p>
          </div>
        </div>
      </div>

      {product.description?.trim() && (
        <section className="mt-16">
          <h2 className="text-xl font-black mb-4" style={{ color: "#253866" }}>
            Descrizione prodotto
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            {isHtmlDescription(product.description) ? (
              <div
                className="text-sm md:text-base text-gray-600 leading-relaxed [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_p]:mb-3 [&_b]:font-bold"
                dangerouslySetInnerHTML={{
                  __html: sanitizeProductHtml(product.description),
                }}
              />
            ) : (
              <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-black mb-6" style={{ color: "#253866" }}>
            Recensioni clienti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div key={review.commentId} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold" style={{ color: "#253866" }}>
                    {review.commentUser}
                  </p>
                  <StarRating score={review.score} />
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(review.commentDate).toLocaleDateString("it-IT")}
                  {review.countryCode ? ` · ${review.countryCode}` : ""}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                {review.commentUrls?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.commentUrls.slice(0, 3).map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5" style={{ color: "#253866" }} />
            <h2 className="text-xl font-black" style={{ color: "#253866" }}>
              Altri prodotti in {categoryLabel}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
