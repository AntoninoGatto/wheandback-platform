import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ensureProductStoreVisibility } from "../workflows/hooks/utils/ensure-product-store-visibility"

/**
 * One-shot repair for products missing `product_seller` / sales-channel links.
 *
 *   npx medusa exec ./src/scripts/backfill-product-store-visibility.ts
 */
export default async function backfillProductStoreVisibility({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "status"],
    filters: {},
  })

  const productIds = ((products || []) as { id: string }[]).map((p) => p.id)
  logger.info(
    `Backfilling store visibility for ${productIds.length} product(s)...`
  )

  const links = await ensureProductStoreVisibility(container, { productIds })
  logger.info(`Backfill complete. Created ${links.length} link(s).`)
}
