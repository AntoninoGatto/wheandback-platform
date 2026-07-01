import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { fetchProductBySlug, fetchRelatedProducts, withTimeout } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const [relatedProducts, authResult] = await Promise.all([
    fetchRelatedProducts(product.category_id, product.id),
    (async () => {
      try {
        const supabase = await createClient();
        return await withTimeout(supabase.auth.getUser(), 5000);
      } catch {
        return { data: { user: null } };
      }
    })(),
  ]);

  const user = authResult.data.user;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <ProductDetailClient
          product={product}
          locale={locale}
          isLoggedIn={!!user}
          relatedProducts={relatedProducts ?? []}
        />
      </main>
      <Footer />
    </div>
  );
}
