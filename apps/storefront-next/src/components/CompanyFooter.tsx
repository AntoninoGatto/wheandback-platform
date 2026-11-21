import { companyProfile } from "@/lib/company";
import { BrandMark } from "@/components/BrandMark";

export function CompanyFooter({ locale }: { locale: string }) {
  const company = companyProfile();
  return (
    <footer className="mt-auto border-t border-[#F1F0F1] bg-white">
      <div className="mx-auto max-w-6xl space-y-1 px-6 py-8 text-sm text-[#293241]">
        <p className="font-semibold text-[#253866]">
          <BrandMark />
        </p>
        <p>{company.legalName}</p>
        <p>Company number {company.companyNumber}</p>
        <p>{company.addressLines.join(", ")}</p>
        {company.vatUk ? <p>UK VAT {company.vatUk}</p> : null}
        {company.vatIt ? <p>P. IVA {company.vatIt}</p> : null}
        <p className="flex gap-4 pt-2">
          <a href={`/${locale}/assistenza`} className="font-semibold text-[#253866]">
            Assistenza
          </a>
          <a href={`/${locale}/recesso`} className="font-semibold text-[#253866]">
            Recesso
          </a>
        </p>
      </div>
    </footer>
  );
}
