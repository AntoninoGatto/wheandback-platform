import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopPageClient from "@/components/shop/ShopPageClient";
import { fetchShopCatalogProducts } from "@/lib/supabase/queries";
import { toShopCatalogProduct } from "@/lib/shop/catalog-product";
import type { ShopCatalogProduct } from "@/types/shop";
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products: ShopCatalogProduct[] = (await fetchShopCatalogProducts()).map(toShopCatalogProduct);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Caricamento shop...</div>}>
          <ShopPageClient products={products} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
