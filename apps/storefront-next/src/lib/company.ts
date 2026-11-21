export type CompanyProfile = {
  legalName: string;
  companyNumber: string;
  addressLines: string[];
  vatUk: string;
  vatIt: string;
};

/** Single storefront source for the seller. The Italian VAT stays hidden while empty. */
export function companyProfile(env: NodeJS.ProcessEnv = process.env): CompanyProfile {
  return {
    legalName: "BUY ALL FREE LTD",
    companyNumber: "13803002",
    addressLines: ["41 Devonshire Street", "Ground Floor", "London W1G 7AJ", "United Kingdom"],
    vatUk: (env.COMPANY_VAT_UK || "GB403855308").trim(),
    vatIt: (env.COMPANY_VAT_IT || "").trim(),
  };
}

export function brandSymbol(env: NodeJS.ProcessEnv = process.env): "®" | "™" {
  return env.TRADEMARK_LICENSE_SIGNED === "true" ? "®" : "™";
}

export function legalApproved(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.LEGAL_APPROVED === "true";
}

export function charityEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CHARITY_ENABLED === "true";
}
