import { redirect } from "next/navigation";
import { importCjProduct } from "@/lib/dropshipping/import-product";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function CjProductImportPage({
  params,
}: {
  params: Promise<{ locale: string; pid: string }>;
}) {
  const { locale, pid } = await params;

  const result = await importCjProduct({
    cjProductId: pid,
    skipAi: true,
  });

  if (!result.success) {
    redirect(`/${locale}/shop?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/${locale}/shop`);
  redirect(`/${locale}/shop/${result.slug}`);
}
