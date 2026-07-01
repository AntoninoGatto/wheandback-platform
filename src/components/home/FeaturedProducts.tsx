import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  cashback_percent: number;
  category_id: string;
  images: string[];
  slug: string;
}

interface FeaturedProductsProps {
  products: Product[];
  locale: string;
  title: string;
  cta: string;
}

export default function FeaturedProducts({ products, locale, title, cta }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20" style={{ backgroundColor: "#f0fdf9" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#253866" }}>
            {title}
          </h2>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80"
            style={{ color: "#00b295" }}
          >
            {cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
