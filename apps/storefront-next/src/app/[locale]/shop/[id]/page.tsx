import Link from "next/link";
import { getProduct } from "@/lib/medusa/store";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CashbackBadge } from "@/components/CashbackBadge";
import { getLoyaltyPlan } from "@/lib/loyalty";

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const plan = await getLoyaltyPlan();
  const { product } = await getProduct(id);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}/shop`}
          className="text-sm font-semibold text-[#253866] hover:opacity-80"
        >
          ← Torna allo Shop
        </Link>

        <div className="mt-6">
          <CashbackBadge label={plan.badge} />
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#253866]">
          {product.title}
        </h1>
        {product.description ? (
          <p className="mt-4 text-gray-700">{product.description}</p>
        ) : null}
        <p className="mt-6 text-xs text-gray-500">ID: {product.id}</p>
      </div>
    </main>
  );
}
