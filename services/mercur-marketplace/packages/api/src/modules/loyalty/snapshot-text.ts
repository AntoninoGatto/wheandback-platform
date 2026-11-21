import { companyProfile } from "../../lib/company"

export type SnapshotLine = {
  sku: string
  qty: number
  initial_price_cents: number
  vat_rate_bps: number
  discount_cents: number
  price_paid_cents: number
  reward_cents: number
  internal_cents: number
  code: string | null
  campaign_version: number | null
}

export function formatEuroCents(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  const abs = Math.abs(Math.round(cents))
  const euros = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const frac = String(abs % 100).padStart(2, "0")
  return `${sign}${euros},${frac} €`
}

export function formatSnapshotText(lines: SnapshotLine[]): string {
  if (!lines.length) return "Nessuno snapshot di vantaggio per questo ordine."
  return lines
    .map((line) => {
      const bits = [
        `${line.sku} × ${line.qty}`,
        `prezzo iniziale ${formatEuroCents(line.initial_price_cents)}`,
        `IVA ${line.vat_rate_bps / 100}%`,
        `sconto ${formatEuroCents(line.discount_cents)}`,
        `pagato ${formatEuroCents(line.price_paid_cents)}`,
        `premio ${formatEuroCents(line.reward_cents)}`,
        `quota interna ${formatEuroCents(line.internal_cents)}`,
        line.code ? `codice ${line.code}` : "nessun codice",
        line.campaign_version != null ? `versione ${line.campaign_version}` : "nessuna versione",
      ]
      return bits.join(" · ")
    })
    .join("\n")
}

export function formatCaseNumber(year: number, sequence: number): string {
  return `WB-${year}-${String(sequence).padStart(4, "0")}`
}

export function sellerLines(env: NodeJS.ProcessEnv = process.env): string[] {
  const company = companyProfile(env)
  const lines = [
    company.legalName,
    `Company number ${company.companyNumber}`,
    company.addressLines.join(", "),
  ]
  if (company.vatUk) lines.push(`UK VAT ${company.vatUk}`)
  if (company.vatIt) lines.push(`P. IVA ${company.vatIt}`)
  return lines
}
