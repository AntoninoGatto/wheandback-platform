import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Enable Stripe payment provider on the Europe region (Step 3).
 *
 *   npx medusa exec ./src/scripts/enable-stripe-region.ts
 */
export default async function enableStripeRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })

  const region = (regions || [])[0] as
    | { id: string; name: string; payment_providers?: { id: string }[] }
    | undefined

  if (!region) {
    throw new Error("No region found")
  }

  const existing = (region.payment_providers || []).map((p) => p.id)
  const providers = Array.from(
    new Set([...existing, "pp_system_default", "pp_stripe_stripe"])
  )

  logger.info(
    `Updating region ${region.name} (${region.id}) providers: ${providers.join(", ")}`
  )

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: {
        payment_providers: providers,
      },
    },
  })

  const { data: after } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id", "payment_providers.is_enabled"],
    filters: { id: region.id },
  })

  logger.info(`Done: ${JSON.stringify(after, null, 2)}`)
}
