import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { actorId } from "../../../../modules/loyalty/domain"
import { assertCanApprove, type CommissionPlan } from "../../../../modules/loyalty/plans"
import { invalidatePlanCache } from "../../../../modules/loyalty/plan-cache"

function mapPlan(row: {
  id: string
  status: string
  created_by: string
  approved_by?: string | null
  starts_at: string
  ends_at?: string | null
  referral_orders: string
  monthly_cap_cents: string
  tiers_json: string
  rules_json: string
}): CommissionPlan {
  return {
    id: row.id,
    status: row.status === "approved" ? "approved" : "draft",
    created_by: row.created_by,
    approved_by: row.approved_by,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    referral_orders: Number(row.referral_orders),
    monthly_cap_cents: Number(row.monthly_cap_cents),
    tiers: JSON.parse(row.tiers_json),
    rules: JSON.parse(row.rules_json),
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listLoyaltyPlans({})
  res.json({ plans: rows.map(mapPlan) })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    starts_at?: string
    ends_at?: string | null
    referral_orders?: number
    monthly_cap_cents?: number
    tiers?: CommissionPlan["tiers"]
    rules?: CommissionPlan["rules"]
  }
  const creatorId = actorId(req as { auth_context?: { actor_id?: string } }) || "unknown"
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const created = await loyalty.createLoyaltyPlans({
    status: "draft",
    created_by: creatorId,
    starts_at: body.starts_at || new Date().toISOString(),
    ends_at: body.ends_at || null,
    referral_orders: String(body.referral_orders ?? 0),
    monthly_cap_cents: String(body.monthly_cap_cents ?? 0),
    tiers_json: JSON.stringify(body.tiers || { A: 0, B: 0, C: 0 }),
    rules_json: JSON.stringify(body.rules || []),
  })
  invalidatePlanCache()
  res.status(201).json({ plan: created })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { id?: string }
  if (!body.id) {
    res.status(400).json({ message: "id obbligatorio" })
    return
  }
  const approverId = actorId(req as { auth_context?: { actor_id?: string } })
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listLoyaltyPlans({ id: body.id })
  const current = rows[0]
  if (!current) {
    res.status(404).json({ message: "Piano non trovato" })
    return
  }
  try {
    assertCanApprove(mapPlan(current), approverId)
  } catch (error) {
    res.status(403).json({ message: error instanceof Error ? error.message : "Non approvabile" })
    return
  }
  const updated = await loyalty.updateLoyaltyPlans({
    id: body.id,
    status: "approved",
    approved_by: approverId,
  })
  invalidatePlanCache()
  res.json({ plan: updated })
}
