"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Tag } from "lucide-react";
import { CASHBACK } from "@/constants/cashback";
import type { ShopCatalogProduct } from "@/types/shop";

interface ProductCardProps {
  product: ShopCatalogProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const referralPercent = Math.min(product.cashback_percent, CASHBACK.REFERRAL_SHARE_PERCENT);
  const referralReward = ((product.price * referralPercent) / 100).toFixed(2);
  const imageUrl = product.images?.[0];

  const href =
    product.slug
      ? `/${locale}/shop/${product.slug}`
      : product.cj_product_id
        ? `/${locale}/shop/cj/${product.cj_product_id}`
        : `/${locale}/shop`;

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
    >
      <div
        className="h-44 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f8f5 100%)" }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-12 h-12 opacity-20" style={{ color: "#253866" }} />
          </div>
        )}

        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-black"
          style={{ backgroundColor: "#00b295" }}
        >
          {referralPercent}% Referral
        </div>

        {product.source === "cj" && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: "rgba(37,56,102,0.88)", color: "white" }}
          >
            Catalogo CJ
          </div>
        )}

        {product.source === "local" && product.supplier_tier !== "cj" && product.supplier !== "cj" && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: "rgba(0,178,149,0.92)", color: "white" }}
          >
            Partner
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold mb-1 line-clamp-2 group-hover:text-[#00b295] transition-colors" style={{ color: "#253866" }}>
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-black" style={{ color: "#253866" }}>
              €{product.price.toFixed(2)}
            </p>
            <p className="text-xs font-semibold" style={{ color: "#00b295" }}>
              Invita: fino a €{referralReward}
            </p>
          </div>

          <button
            className="p-2.5 rounded-xl text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#00b295" }}
            onClick={(e) => {
              e.preventDefault();
            }}
            aria-label="Aggiungi al carrello"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
