export type CompanyProfile = {
  legalName: string
  companyNumber: string
  addressLines: string[]
  vatUk: string
  /** Empty string hides the Italian VAT field. */
  vatIt: string
}

/** Public company facts. VAT numbers come from the environment; the Italian one stays empty unless set. */
export function companyProfile(env: NodeJS.ProcessEnv = process.env): CompanyProfile {
  return {
    legalName: "BUY ALL FREE LTD",
    companyNumber: "13803002",
    addressLines: ["41 Devonshire Street", "Ground Floor", "London W1G 7AJ", "United Kingdom"],
    vatUk: (env.COMPANY_VAT_UK || "GB403855308").trim(),
    vatIt: (env.COMPANY_VAT_IT || "").trim(),
  }
}
