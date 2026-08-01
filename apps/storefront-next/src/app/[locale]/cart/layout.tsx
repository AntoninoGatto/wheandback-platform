import { StorefrontHeader } from "@/components/StorefrontHeader";

interface CartLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CartLayout({ children, params }: CartLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StorefrontHeader locale={locale} />
      {children}
    </div>
  );
}
