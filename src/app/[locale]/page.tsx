import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ReferralHighlight from "@/components/home/ReferralHighlight";
import CharitySection from "@/components/home/CharitySection";
import HomeCTAGrid from "@/components/home/HomeCTAGrid";
import WelcomeSection from "@/components/home/WelcomeSection";
import { fetchTrendingProducts } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home.featured_products");
  const products = await fetchTrendingProducts(8);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeaturedProducts
          products={products}
          locale={locale}
          title={t("title")}
          cta={t("cta")}
        />
        <ReferralHighlight />
        <CharitySection />
        <HomeCTAGrid />
        <WelcomeSection />
      </main>
      <Footer />
    </div>
  );
}
