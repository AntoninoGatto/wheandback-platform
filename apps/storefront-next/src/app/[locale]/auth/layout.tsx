import { StorefrontHeader } from "@/components/StorefrontHeader";

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StorefrontHeader locale={locale} />
      {children}
    </div>
  );
}
