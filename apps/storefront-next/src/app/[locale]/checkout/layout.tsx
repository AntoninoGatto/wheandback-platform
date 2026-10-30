import { StorefrontHeader } from "@/components/StorefrontHeader";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CheckoutLayout({ children, params }: CheckoutLayoutProps) {
  const { locale } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      {children}
    </div>
  );
}
