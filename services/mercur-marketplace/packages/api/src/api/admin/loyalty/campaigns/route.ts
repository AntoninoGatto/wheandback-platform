import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { actorId } from "../../../../modules/loyalty/domain"
import { campaignOverlapError, type CampaignWindow } from "../../../../modules/loyalty/campaigns"
import { assertCanApprove } from "../../../../modules/loyalty/plans"
import { invalidatePlanCache } from "../../../../modules/loyalty/plan-cache"
import { revalidateStorefrontTags } from "../../../../lib/revalidate"

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const campaigns = await loyalty.listCampaigns({})
  res.json({ campaigns })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    public_code?: string
    version?: number
    starts_at?: string
    ends_at?: string
    timezone?: string
    budget_cents?: number
    max_uses?: number | null
    lines?: { variant_id: string; discount_bps: number; referral_bps_override?: number | null }[]
  }
  if (!body.public_code || !body.starts_at || !body.ends_at || !body.lines?.length) {
    res.status(400).json({ message: "Codice, date e righe sono obbligatori." })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const created = await loyalty.createCampaigns({
    public_code: body.public_code.trim().toUpperCase(),
    version: String(body.version ?? 1),
    status: "draft",
    starts_at: body.starts_at,
    ends_at: body.ends_at,
    timezone: body.timezone || "Europe/Rome",
    budget_cents: body.budget_cents == null ? null : String(body.budget_cents),
    max_uses: body.max_uses == null ? null : String(body.max_uses),
    created_by: actorId(req as { auth_context?: { actor_id?: string } }) || "unknown",
    approved_by: null,
    activated_at: null,
  })
  for (const line of body.lines) {
    await loyalty.createCampaignLines({
      campaign_id: created.id,
      variant_id: line.variant_id,
      discount_bps: String(line.discount_bps),
      referral_bps_override: line.referral_bps_override == null ? null : String(line.referral_bps_override),
    })
  }
  res.status(201).json({ campaign: created })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { id?: string }
  if (!body.id) {
    res.status(400).json({ message: "id obbligatorio" })
    return
  }
  const approverId = actorId(req as { auth_context?: { actor_id?: string } })
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listCampaigns({ id: body.id })
  const current = rows[0]
  if (!current) {
    res.status(404).json({ message: "Campagna non trovata" })
    return
  }
  try {
    assertCanApprove(
      { id: current.id, status: current.status === "approved" ? "approved" : "draft", created_by: current.created_by, starts_at: current.starts_at, referral_orders: 0, monthly_cap_cents: 0, tiers: { A: 0, B: 0, C: 0 }, rules: [] },
      approverId
    )
  } catch (error) {
    res.status(403).json({ message: error instanceof Error ? error.message : "Non approvabile" })
    return
  }
  const lines = await loyalty.listCampaignLines({ campaign_id: current.id })
  const existingCampaigns = await loyalty.listCampaigns({})
  const personal = await loyalty.listReferralLinks({})
  const windows: CampaignWindow[] = []
  for (const campaign of existingCampaigns) {
    const campaignLines = campaign.id === current.id ? lines : await loyalty.listCampaignLines({ campaign_id: campaign.id })
    windows.push({
      id: campaign.id,
      public_code: campaign.public_code,
      status: campaign.status === "approved" || campaign.status === "expired" ? campaign.status : "draft",
      starts_at: campaign.starts_at,
      ends_at: campaign.ends_at,
      lines: campaignLines.map((line) => ({ variant_id: line.variant_id, discount_bps: num(line.discount_bps) })),
    })
  }
  const candidate = windows.find((item) => item.id === current.id)
  if (!candidate) {
    res.status(404).json({ message: "Campagna non trovata" })
    return
  }
  const error = campaignOverlapError(
    windows.filter((item) => item.id !== current.id),
    { ...candidate, status: "approved" },
    personal.map((link) => link.code)
  )
  if (error) {
    res.status(409).json({ message: error })
    return
  }
  const updated = await loyalty.updateCampaigns({
    id: current.id,
    status: "approved",
    approved_by: approverId,
  })
  invalidatePlanCache()
  await revalidateStorefrontTags(["campaigns", "variant-offers"])
  res.json({ campaign: updated })
}
