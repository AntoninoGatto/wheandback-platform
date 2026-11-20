import type { MedusaContainer } from "@medusajs/framework/types"
import { revalidateStorefrontTags } from "../lib/revalidate"
import { LOYALTY_MODULE } from "../modules/loyalty"
import { nextCampaignStatus } from "../modules/loyalty/campaigns"

export default async function campaignWindow(container: MedusaContainer) {
  const loyalty = container.resolve(LOYALTY_MODULE)
  const now = new Date().toISOString()
  const campaigns = await loyalty.listPromoCampaigns({})
  let changed = false
  for (const campaign of campaigns) {
    const next = nextCampaignStatus(campaign.status, campaign.ends_at, now)
    if (next) {
      await loyalty.updatePromoCampaigns({ id: campaign.id, status: next })
      changed = true
      continue
    }
    if (campaign.status === "approved" && !campaign.activated_at && Date.parse(campaign.starts_at) <= Date.parse(now)) {
      await loyalty.updatePromoCampaigns({ id: campaign.id, activated_at: now })
      changed = true
    }
  }
  const reservations = await loyalty.listCodeReservations({ status: "reserved" })
  for (const reservation of reservations) {
    if (Date.parse(reservation.expires_at) <= Date.parse(now)) {
      await loyalty.updateCodeReservations({ id: reservation.id, status: "released" })
      changed = true
    }
  }
  if (changed) await revalidateStorefrontTags(["campaigns", "variant-offers"])
}

export const config = {
  name: "campaign-window",
  schedule: "*/15 * * * *",
}
