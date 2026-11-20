import type { ExecArgs } from "@medusajs/framework/types"
import fs from "fs"
import { LOYALTY_MODULE } from "../modules/loyalty"
import { classifyImport, type ClassifiedRow } from "../modules/loyalty/supplier-import"

function numberOrZero(value: string | undefined): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(Math.round(parsed)) : "0"
}

export default async function importSupplierCsv({ container }: ExecArgs) {
  const file = process.argv.find((arg) => arg.endsWith(".csv"))
  if (!file) throw new Error("Passa il percorso di un file .csv")
  const loyalty = container.resolve(LOYALTY_MODULE) as {
    createVariantEconomics: (data: Record<string, string | null>) => Promise<unknown>
    createCampaigns: (data: Record<string, string | null>) => Promise<{ id: string }>
    createCampaignLines: (data: Record<string, string | null>) => Promise<unknown>
  }
  const rows = classifyImport(fs.readFileSync(file, "utf8"))
  const summary: { sku: string; status: "draft"; blocked: boolean; reasons: string[] }[] = []
  for (const item of rows) {
    summary.push(await persistDraft(loyalty, item))
  }
  process.stdout.write(`${JSON.stringify({ imported: summary.length, rows: summary }, null, 2)}\n`)
}

async function persistDraft(
  loyalty: {
    createVariantEconomics: (data: Record<string, string | null>) => Promise<unknown>
    createCampaigns: (data: Record<string, string | null>) => Promise<{ id: string }>
    createCampaignLines: (data: Record<string, string | null>) => Promise<unknown>
  },
  item: ClassifiedRow
) {
  const row = item.row
  if (!row.variant_id || !row.sku) {
    return { sku: row.sku || "", status: "draft" as const, blocked: true, reasons: item.reasons }
  }
  await loyalty.createVariantEconomics({
    variant_id: row.variant_id,
    sku: row.sku,
    supplier_id: row.supplier_id || "sconosciuto",
    price_list_source: row.price_list_source || null,
    price_list_date: row.price_list_date || null,
    supplier_cost_cents: numberOrZero(row.supplier_cost_cents),
    reference_price_cents: numberOrZero(row.reference_price_cents),
    reference_basis: row.reference_basis === "gross" ? "gross" : "net",
    vat_rate_bps: numberOrZero(row.vat_rate_bps),
    public_price_cents: numberOrZero(row.public_price_cents),
    reward_base_cents: numberOrZero(row.reward_base_cents),
    min_margin_bps: numberOrZero(row.min_margin_bps),
    compliance_status: item.blocked ? "missing" : row.compliance_status || "missing",
    image_rights: row.image_rights || null,
    review_note: item.reasons.join("; ") || null,
  })
  if (row.public_code && row.discount_bps && row.starts_at && row.ends_at) {
    const campaign = await loyalty.createCampaigns({
      public_code: row.public_code,
      version: "1",
      status: "draft",
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      timezone: "Europe/Rome",
      budget_cents: null,
      max_uses: null,
      created_by: "import",
      approved_by: null,
      activated_at: null,
    })
    await loyalty.createCampaignLines({
      campaign_id: campaign.id,
      variant_id: row.variant_id,
      discount_bps: numberOrZero(row.discount_bps),
      referral_bps_override: row.referral_bps_override || null,
    })
  }
  return { sku: row.sku, status: "draft" as const, blocked: item.blocked, reasons: item.reasons }
}
